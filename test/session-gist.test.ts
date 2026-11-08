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
 * Runs the git-workflow session shims against a stub `claude-extract` that
 * behaves like the real one where it matters: `--list` numbers sessions by
 * recency and shows only the first eight characters of each ID, and
 * `--extract N` re-reads the list before resolving N. Lines in `shifts` are
 * consumed one per `--extract`, each moving that session to the top first —
 * the reordering a concurrently active session causes by writing to its log.
 */

const ROOT = resolve(import.meta.dir, "..");
const BIN = join(ROOT, "plugins/git-workflow/bin");
const BASH = Bun.which("bash") ?? "/bin/bash";
// Run under /bin/bash too: it is bash 3.2 on a stock Mac.
const SHELLS = [...new Set([BASH, "/bin/bash"])].filter(existsSync);

const UTILITIES = [
	"cat",
	"cut",
	"mkdir",
	"dirname",
	"find",
	"grep",
	"head",
	"mktemp",
	"mv",
	"rm",
	"sed",
	"tr",
];

const CURRENT = "e2349f75-1111-4222-8333-444455556666";
const NESTED = "a83ce4b6-aaaa-4bbb-8ccc-ddddeeeeffff";
const OLDER = "0d1e2f3a-9999-4888-8777-666655554444";

const CLAUDE_EXTRACT = `#!/bin/sh
dir=$(dirname "$0")/..
order="$dir/order"
case " $* " in
*" --list "*)
	n=0
	while IFS= read -r id; do
		n=$((n + 1))
		printf '\\n%s. 📁 ~/proj\\n   📄 Session: %s...\\n' "$n" "$(printf '%s' "$id" | cut -c1-8)"
	done <"$order"
	;;
*" --extract "*)
	printf '%s\\n' "claude-extract $*" >>"$dir/calls.log"
	if [ -s "$dir/shifts" ]; then
		mover=$(head -n 1 "$dir/shifts")
		sed -i.bak 1d "$dir/shifts"
		{ printf '%s\\n' "$mover"; grep -vxF "$mover" "$order"; } >"$order.new"
		mv "$order.new" "$order"
	fi
	while [ $# -gt 0 ]; do
		case "$1" in
		--extract) indices=$2; shift ;;
		--output) out=$2; shift ;;
		esac
		shift
	done
	for idx in $(printf '%s' "$indices" | tr ',' ' '); do
		id=$(sed -n "\${idx}p" "$order")
		[ -n "$id" ] || continue
		printf '# Claude Conversation Log\\n\\nSession ID: %s\\nDate: 2026-11-08\\n\\n---\\n\\nbody of %s\\n%s\\n' \\
			"$id" "$id" "\${QUOTE:-}" >"$out/claude-conversation-2026-11-08-$(printf '%s' "$id" | cut -c1-8).md"
	done
	;;
esac
`;

const GH = `#!/bin/sh
dir=$(dirname "$0")/..
printf '%s\\n' "gh $*" >>"$dir/calls.log"
cat >"$dir/gist.md"
echo "https://gist.github.com/secret"
`;

type Run = { code: number; stdout: string; stderr: string };

let dir: string;
let home: string;
let shell: string;

const projects = () => join(home, ".claude", "projects", "-proj");

/** Writes a transcript and lists the sessions, most recent first. */
const sessions = async (...ids: string[]) => {
	for (const id of ids) {
		const parent = id.startsWith("agent-")
			? join(projects(), CURRENT, "subagents")
			: projects();
		await mkdir(parent, { recursive: true });
		await writeFile(join(parent, `${id}.jsonl`), "{}\n");
	}
	await writeFile(join(dir, "order"), `${ids.join("\n")}\n`);
};

/** Sessions that each move ahead of the current one once, so it never holds still. */
const BUSY = [1, 2, 3, 4, 5, 6].map(
	(n) => `${n}${n}${n}${n}0000-0000-4000-8000-00000000000${n}`,
);

const shifts = (...ids: string[]) =>
	writeFile(join(dir, "shifts"), `${ids.join("\n")}\n`);

const calls = async () => {
	const log = join(dir, "calls.log");
	return existsSync(log)
		? (await readFile(log, "utf8")).trim().split("\n")
		: [];
};

const run = async (
	script: string,
	args: string[],
	env: Record<string, string> = {},
): Promise<Run> => {
	const proc = Bun.spawn([shell, join(BIN, script), ...args], {
		cwd: home,
		env: { HOME: home, PATH: join(dir, "bin"), ...env },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);
	return { code, stdout, stderr };
};

beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), "session-gist-"));
	home = join(dir, "home");
	const bin = join(dir, "bin");
	await mkdir(home);
	await mkdir(bin);
	for (const name of UTILITIES) {
		const real = Bun.which(name);
		if (!real) throw new Error(`session-gist tests need ${name} on PATH`);
		await symlink(real, join(bin, name));
	}
	for (const [name, body] of [
		["claude-extract", CLAUDE_EXTRACT],
		["gh", GH],
	]) {
		await writeFile(join(bin, name), body);
		await chmod(join(bin, name), 0o755);
	}
});

afterEach(async () => {
	await rm(dir, { recursive: true, force: true });
});

/**
 * Runs each shim under `bash`, which is also the `bash` on PATH, so the gist
 * shim's `#!/usr/bin/env bash` sibling runs under the same one.
 */
const useShell = (bash: string) =>
	beforeEach(async () => {
		shell = bash;
		await symlink(bash, join(dir, "bin", "bash"));
	});

for (const bash of SHELLS) {
	describe(`git-workflow: claude-extract-session (${bash})`, () => {
		useShell(bash);

		const SCRIPT = "claude-extract-session";

		test("prints the requested session", async () => {
			await sessions(NESTED, CURRENT, OLDER);

			const { code, stdout } = await run(SCRIPT, [CURRENT]);

			expect(code).toBe(0);
			expect(stdout).toContain(`Session ID: ${CURRENT}\n`);
			expect(stdout).toContain(`body of ${CURRENT}`);
		});

		test("still prints the requested session when another session moves ahead of it", async () => {
			await sessions(CURRENT, NESTED, OLDER);
			await shifts(NESTED);

			const { code, stdout } = await run(SCRIPT, [CURRENT]);

			expect(code).toBe(0);
			expect(stdout).toContain(`Session ID: ${CURRENT}\n`);
			expect(stdout).not.toContain(NESTED);
		});

		test("tells apart agent sessions that share the listed eight-character prefix", async () => {
			const wanted = "agent-a5b6c7d8";
			const sibling = "agent-a5f0e1d2";
			await sessions(sibling, wanted);

			const { code, stdout } = await run(SCRIPT, [wanted]);

			expect(code).toBe(0);
			expect(stdout).toContain(`Session ID: ${wanted}\n`);
			expect(stdout).not.toContain(sibling);
		});

		test("is not fooled by another session that quotes the requested ID in its body", async () => {
			await sessions(CURRENT, ...BUSY);
			await shifts(...BUSY);

			const { code, stdout } = await run(SCRIPT, [CURRENT], {
				QUOTE: `Session ID: ${CURRENT}`,
			});

			expect(code).not.toBe(0);
			expect(stdout).toBe("");
		});

		test("fails with no output when the list keeps moving", async () => {
			await sessions(CURRENT, ...BUSY);
			await shifts(...BUSY);

			const { code, stdout, stderr } = await run(SCRIPT, [CURRENT]);

			expect(code).not.toBe(0);
			expect(stdout).toBe("");
			expect(stderr).toContain(CURRENT);
		});

		test("fails without extracting when no transcript has the full ID", async () => {
			await sessions(OLDER);
			// Listed, so a prefix match alone would find it.
			await writeFile(
				join(dir, "order"),
				`${CURRENT.slice(0, 8)}-not-the-same\n`,
			);

			const { code, stdout } = await run(SCRIPT, [CURRENT]);

			expect(code).not.toBe(0);
			expect(stdout).toBe("");
			expect(await calls()).toEqual([]);
		});

		test("finds transcripts under CLAUDE_CONFIG_DIR", async () => {
			const config = join(dir, "config");
			await mkdir(join(config, "projects", "-proj"), { recursive: true });
			await writeFile(
				join(config, "projects", "-proj", `${CURRENT}.jsonl`),
				"{}\n",
			);
			await writeFile(join(dir, "order"), `${CURRENT}\n`);

			const { code, stdout } = await run(SCRIPT, [CURRENT], {
				CLAUDE_CONFIG_DIR: config,
			});

			expect(code).toBe(0);
			expect(stdout).toContain(`Session ID: ${CURRENT}\n`);
		});
	});

	describe(`git-workflow: claude-session-gist (${bash})`, () => {
		useShell(bash);

		const SCRIPT = "claude-session-gist";

		test("uploads the requested session and prints only the gist URL", async () => {
			await sessions(CURRENT, NESTED);
			await shifts(NESTED);

			const { code, stdout } = await run(SCRIPT, [CURRENT, "fix/foo"]);

			expect(code).toBe(0);
			expect(stdout).toBe("https://gist.github.com/secret\n");
			const gist = await readFile(join(dir, "gist.md"), "utf8");
			expect(gist).toContain(`Session ID: ${CURRENT}\n`);
			expect(gist).not.toContain(NESTED);
			expect(await calls()).toContain(
				"gh gist create --filename pr-conversation-fix-foo.md -",
			);
		});

		test("uploads nothing when the session cannot be extracted", async () => {
			await sessions(CURRENT, ...BUSY);
			await shifts(...BUSY);

			const { code, stdout } = await run(SCRIPT, [CURRENT, "fix/foo"]);

			expect(code).toBe(1);
			expect(stdout).toBe("");
			expect((await calls()).filter((c) => c.startsWith("gh "))).toEqual([]);
		});
	});
}
