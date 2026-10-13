import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import {
	chmod,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/**
 * Runs each plugin hook script the way Claude Code does — hook JSON on stdin,
 * exit code and stdout read back — inside a sandbox whose PATH holds only the
 * utilities the scripts need plus stubs for the tools they probe for
 * (chezmoi, mise, gem, ruby-lsp). Without that isolation the outcome would
 * depend on whatever happens to be installed on the machine running the tests:
 * a developer with chezmoi on PATH and a CI runner without it would exercise
 * different branches of the same script.
 *
 * Stubs append their argv to `calls.log`, so a test can assert both what a hook
 * decided and what it asked the stubbed tool along the way.
 */

const ROOT = resolve(import.meta.dir, "..");
const BASH = Bun.which("bash") ?? "/bin/bash";

/** Real utilities the hook scripts (and stubs) shell out to. Anything else is a stub. */
const UTILITIES = ["awk", "cat", "chmod", "dirname", "grep", "jq", "tr"];

type Sandbox = {
	dir: string;
	home: string;
	bin: string;
	/** Writes an executable stub into the sandbox PATH that logs its argv. */
	stub: (name: string, body?: string) => Promise<void>;
	calls: () => Promise<string[]>;
	run: (
		script: string,
		options?: { stdin?: unknown; cwd?: string; bash?: string },
	) => Promise<{ code: number; stdout: string; stderr: string }>;
};

let sandbox: Sandbox;

beforeEach(async () => {
	const dir = await mkdtemp(join(tmpdir(), "hook-scripts-"));
	const home = join(dir, "home");
	const bin = join(dir, "bin");
	const log = join(dir, "calls.log");
	await mkdir(home);
	await mkdir(bin);
	for (const name of UTILITIES) {
		const real = Bun.which(name);
		if (!real) throw new Error(`hook tests need ${name} on PATH`);
		await symlink(real, join(bin, name));
	}

	sandbox = {
		dir,
		home,
		bin,
		stub: async (name, body = "exit 0") => {
			const path = join(bin, name);
			await writeFile(
				path,
				`#!/bin/sh\nprintf '%s\\n' "${name} $*" >> '${log}'\n${body}\n`,
			);
			await chmod(path, 0o755);
		},
		calls: async () =>
			existsSync(log) ? (await readFile(log, "utf8")).trim().split("\n") : [],
		run: async (script, { stdin = {}, cwd = home, bash = BASH } = {}) => {
			const proc = Bun.spawn([bash, join(ROOT, script)], {
				cwd,
				env: { HOME: home, PATH: bin },
				stdin: new TextEncoder().encode(JSON.stringify(stdin)),
				stdout: "pipe",
				stderr: "pipe",
			});
			const [stdout, stderr, code] = await Promise.all([
				new Response(proc.stdout).text(),
				new Response(proc.stderr).text(),
				proc.exited,
			]);
			return { code, stdout, stderr };
		},
	};
});

afterEach(async () => {
	await rm(sandbox.dir, { recursive: true, force: true });
});

const editOf = (filePath: string) => ({
	hook_event_name: "PreToolUse",
	tool_name: "Edit",
	tool_input: { file_path: filePath },
});

const writeSettings = async (dir: string, repoPath: string) => {
	await mkdir(join(dir, ".claude"), { recursive: true });
	await writeFile(
		join(dir, ".claude", "dotfiles.local.md"),
		`---\nrepo_path: "${repoPath}"\n---\n\nDotfiles plugin settings.\n`,
	);
};

describe("dotfiles: enforce-source-only.sh", () => {
	const SCRIPT = "plugins/dotfiles/hooks/scripts/enforce-source-only.sh";

	/** A chezmoi that reports `managed` as managed and everything else not. */
	const stubChezmoi = (managed: string, source: string) =>
		sandbox.stub(
			"chezmoi",
			`for last; do :; done
[ "$last" = '${managed}' ] || exit 1
echo '${source}'`,
		);

	test("blocks an edit to a managed destination and names the source file", async () => {
		const dest = join(sandbox.home, ".zshrc");
		const source = "/src/dotfiles/home/dot_zshrc";
		await stubChezmoi(dest, source);

		const { code, stdout, stderr } = await sandbox.run(SCRIPT, {
			stdin: editOf(dest),
		});

		// Exit 2 blocks the call even if the JSON is malformed. Claude Code
		// shows Claude the JSON decision's reason, falling back to stderr.
		expect(code).toBe(2);
		const { hookSpecificOutput: output } = JSON.parse(stdout);
		expect(output.hookEventName).toBe("PreToolUse");
		expect(output.permissionDecision).toBe("deny");
		expect(output.permissionDecisionReason).toContain(
			`${dest} is Chezmoi-managed`,
		);
		expect(output.permissionDecisionReason).toContain(source);
		expect(stderr.trim()).toBe(output.permissionDecisionReason.trim());
	});

	test("expands a leading ~ before asking chezmoi", async () => {
		const dest = join(sandbox.home, ".zshrc");
		await stubChezmoi(dest, "/src/dotfiles/home/dot_zshrc");

		const { code } = await sandbox.run(SCRIPT, { stdin: editOf("~/.zshrc") });

		expect(code).toBe(2);
		expect(await sandbox.calls()).toEqual([`chezmoi source-path ${dest}`]);
	});

	test("allows an edit chezmoi does not manage", async () => {
		await stubChezmoi(join(sandbox.home, ".zshrc"), "unused");

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(join(sandbox.home, "notes.txt")),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});

	test("allows an edit outside $HOME without consulting chezmoi", async () => {
		await sandbox.stub("chezmoi", "echo /should/not/be/used");

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf("/etc/hosts"),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
		expect(await sandbox.calls()).toEqual([]);
	});

	test("fails open when chezmoi is not installed", async () => {
		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(join(sandbox.home, ".zshrc")),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});

	test("allows a tool call that carries no file path", async () => {
		await sandbox.stub("chezmoi", "echo /should/not/be/used");

		const { code } = await sandbox.run(SCRIPT, {
			stdin: { tool_name: "Edit", tool_input: {} },
		});

		expect(code).toBe(0);
		expect(await sandbox.calls()).toEqual([]);
	});

	test("points chezmoi at the configured repo_path, preferring the project setting", async () => {
		const userRepo = join(sandbox.dir, "user-repo");
		const projectRepo = join(sandbox.dir, "project-repo");
		const project = join(sandbox.dir, "project");
		await mkdir(userRepo);
		await mkdir(projectRepo);
		await writeSettings(sandbox.home, userRepo);
		await writeSettings(project, projectRepo);
		const dest = join(sandbox.home, ".zshrc");
		await stubChezmoi(dest, `${projectRepo}/home/dot_zshrc`);

		const fromHome = await sandbox.run(SCRIPT, { stdin: editOf(dest) });
		const fromProject = await sandbox.run(SCRIPT, {
			stdin: editOf(dest),
			cwd: project,
		});

		expect(fromHome.code).toBe(2);
		expect(fromProject.code).toBe(2);
		expect(await sandbox.calls()).toEqual([
			`chezmoi --source ${userRepo} source-path ${dest}`,
			`chezmoi --source ${projectRepo} source-path ${dest}`,
		]);
	});

	test("ignores a configured repo_path that does not exist", async () => {
		await writeSettings(sandbox.home, join(sandbox.dir, "missing"));
		const dest = join(sandbox.home, ".zshrc");
		await stubChezmoi(dest, "/src/dotfiles/home/dot_zshrc");

		const { code } = await sandbox.run(SCRIPT, { stdin: editOf(dest) });

		expect(code).toBe(2);
		expect(await sandbox.calls()).toEqual([`chezmoi source-path ${dest}`]);
	});
});

describe("dotfiles: chezmoi-diff-reminder.sh", () => {
	const SCRIPT = "plugins/dotfiles/hooks/scripts/chezmoi-diff-reminder.sh";

	/**
	 * A dotfiles repo whose source state lives in home/, named by .chezmoiroot —
	 * the layout this plugin targets. `chezmoi source-path` reports the home/
	 * directory itself, not the repo root.
	 */
	const chezmoiRootRepo = async () => {
		const repo = join(sandbox.dir, "dotfiles");
		await mkdir(join(repo, "home"), { recursive: true });
		await writeFile(join(repo, ".chezmoiroot"), "home\n");
		return repo;
	};

	const reminded = (stdout: string, edited: string) =>
		expect(JSON.parse(stdout).systemMessage).toContain(`Edited ${edited}`);

	test("reminds after editing the source tree named by .chezmoiroot", async () => {
		const repo = await chezmoiRootRepo();
		await writeSettings(sandbox.home, repo);
		const edited = join(repo, "home", "dot_zshrc");

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(edited),
		});

		expect(code).toBe(0);
		reminded(stdout, edited);
	});

	test("stays quiet for repo files outside the .chezmoiroot source tree", async () => {
		const repo = await chezmoiRootRepo();
		await writeSettings(sandbox.home, repo);

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(join(repo, "README.md")),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});

	// With no settings file the hook asks chezmoi, whose source-path already
	// ends in the .chezmoiroot directory. Appending home/ again meant the
	// reminder never fired for anyone relying on chezmoi's own config.
	test("reminds using chezmoi source-path when no settings file exists", async () => {
		const repo = await chezmoiRootRepo();
		await sandbox.stub("chezmoi", `echo '${join(repo, "home")}'`);
		const edited = join(repo, "home", "dot_zshrc");

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(edited),
		});

		expect(code).toBe(0);
		reminded(stdout, edited);
	});

	test("stays quiet outside chezmoi source-path when no settings file exists", async () => {
		const repo = await chezmoiRootRepo();
		await sandbox.stub("chezmoi", `echo '${join(repo, "home")}'`);

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(join(repo, "README.md")),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});

	test("treats the repo root as the source tree when there is no .chezmoiroot", async () => {
		const repo = join(sandbox.dir, "dotfiles");
		await mkdir(repo);
		await writeSettings(sandbox.home, repo);
		const edited = join(repo, "dot_zshrc");

		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(edited),
		});

		expect(code).toBe(0);
		reminded(stdout, edited);
	});

	test("stays quiet when neither settings nor chezmoi can locate the repo", async () => {
		const { code, stdout } = await sandbox.run(SCRIPT, {
			stdin: editOf(join(sandbox.dir, "dotfiles", "home", "dot_zshrc")),
		});

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});
});

describe("mise: session-start-check.sh", () => {
	const SCRIPT = "plugins/mise/hooks/scripts/session-start-check.sh";

	test("stays silent when mise is not installed", async () => {
		await writeFile(join(sandbox.home, "package.json"), "{}");

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});

	test("nudges toward /mise-init in a code project without mise.toml", async () => {
		await sandbox.stub("mise");
		await writeFile(join(sandbox.home, "package.json"), "{}");

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toContain("no mise.toml found");
	});

	test("surfaces mise doctor output when doctor reports problems", async () => {
		await sandbox.stub("mise", "echo 'shim path is not on PATH'; exit 1");
		await writeFile(join(sandbox.home, "mise.toml"), "[tools]\n");

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toContain("mise doctor found issues:");
		expect(stdout).toContain("shim path is not on PATH");
	});

	test("stays silent when mise doctor is healthy", async () => {
		await sandbox.stub("mise", "echo 'all good'");
		await writeFile(join(sandbox.home, "mise.toml"), "[tools]\n");

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toBe("");
	});
});

describe("ruby-rails: check-ruby-lsp.sh", () => {
	const SCRIPT = "plugins/ruby-rails/hooks/scripts/check-ruby-lsp.sh";

	/** A gem that "installs" ruby-lsp by dropping a stub of it on PATH. */
	const stubInstallingGem = () =>
		sandbox.stub(
			"gem",
			`printf '#!/bin/sh\\n' > '${sandbox.bin}/ruby-lsp'
chmod +x '${sandbox.bin}/ruby-lsp'`,
		);

	/** mise that reports a managed Ruby (or none) and runs `exec --` commands. */
	const stubMise = (managesRuby: boolean) =>
		sandbox.stub(
			"mise",
			`case "$1" in
which) ${managesRuby ? "echo /mise/installs/ruby/bin/ruby" : "exit 1"} ;;
exec) shift 2; exec "$@" ;;
esac`,
		);

	const rubyProject = () => writeFile(join(sandbox.home, "Gemfile"), "");

	// The hook runs on every SessionStart in every repo. Outside a Ruby project
	// it must not install anything, or even look: an install there took up to
	// the hook's 120-second timeout for nothing.
	test("does nothing outside a Ruby project", async () => {
		await stubMise(true);
		await stubInstallingGem();

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toBe("");
		expect(await sandbox.calls()).toEqual([]);
	});

	test.each([
		["Gemfile", "Gemfile", ""],
		["gems.rb", "gems.rb", ""],
		["a gemspec", "widget.gemspec", ""],
		[".ruby-version", ".ruby-version", "3.4.1\n"],
		["mise.toml with ruby", "mise.toml", '[tools]\nruby = "3.4"\n'],
		[".tool-versions with ruby", ".tool-versions", "ruby 3.4.1\n"],
	])("treats a directory with %s as a Ruby project", async (_, file, body) => {
		await writeFile(join(sandbox.home, file), body);
		await stubMise(true);
		await stubInstallingGem();

		const { stdout } = await sandbox.run(SCRIPT);

		expect(stdout).toContain("Installed successfully");
	});

	test("ignores a mise.toml that does not pin Ruby", async () => {
		await writeFile(join(sandbox.home, "mise.toml"), '[tools]\nnode = "22"\n');
		await stubMise(true);
		await stubInstallingGem();

		const { stdout } = await sandbox.run(SCRIPT);

		expect(stdout).toBe("");
		expect(await sandbox.calls()).toEqual([]);
	});

	test("does nothing when ruby-lsp is already installed", async () => {
		await rubyProject();
		await sandbox.stub("ruby-lsp");
		await stubMise(true);
		await stubInstallingGem();

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toBe("");
		expect(await sandbox.calls()).toEqual([]);
	});

	test("installs ruby-lsp onto the mise-managed Ruby", async () => {
		await rubyProject();
		await stubMise(true);
		await stubInstallingGem();

		const { code, stdout } = await sandbox.run(SCRIPT);

		expect(code).toBe(0);
		expect(stdout).toContain("Installed successfully");
		expect(await sandbox.calls()).toEqual([
			"mise which ruby",
			"mise exec -- gem install ruby-lsp",
			"gem install ruby-lsp",
		]);
	});

	// conventions.md: never `gem install` into the system Ruby. Without a
	// mise-managed Ruby, `mise exec -- gem` and a bare `gem` both resolve to
	// whatever Ruby is on PATH, so the hook only explains how to install.
	// Run under /bin/bash too: it is bash 3.2 on a stock Mac.
	const shells = [...new Set([BASH, "/bin/bash"])].filter(existsSync);
	for (const shell of shells) {
		test(`never installs into a Ruby mise does not manage (${shell})`, async () => {
			await rubyProject();
			await stubMise(false);
			await stubInstallingGem();

			const { code, stdout, stderr } = await sandbox.run(SCRIPT, {
				bash: shell,
			});

			expect(stderr).toBe("");
			expect(code).toBe(0);
			expect(stdout).toContain("ruby-lsp is not installed.");
			expect(await sandbox.calls()).toEqual(["mise which ruby"]);
		});

		test(`never installs with a bare gem when mise is absent (${shell})`, async () => {
			await rubyProject();
			await stubInstallingGem();

			const { code, stdout, stderr } = await sandbox.run(SCRIPT, {
				bash: shell,
			});

			expect(stderr).toBe("");
			expect(code).toBe(0);
			expect(stdout).toContain("ruby-lsp is not installed.");
			expect(await sandbox.calls()).toEqual([]);
		});
	}
});
