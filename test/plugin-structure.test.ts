import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Glob } from "bun";

/**
 * Structural guards for the plugins themselves. Each one covers a mistake that
 * is silent today: nothing fails until a user installs the plugin, or never
 * fails at all and the plugin simply does less than it should. Most of these
 * pass on the day they were written; they exist to catch the next drift.
 *
 * marketplace-versions.test.ts checks the published entries against their
 * plugin.json. This file checks the plugin directories from the other side.
 */

const marketplace = JSON.parse(
	await readFile(".claude-plugin/marketplace.json", "utf8"),
);
const published = new Set<string>(
	marketplace.plugins.map((p: { name: string }) => p.name),
);

/**
 * Directories under plugins/ that are not published on purpose. example-plugin
 * is the scaffold that create-plugin copies from, not something to install.
 */
const UNPUBLISHED = ["example-plugin"];

/**
 * Directories under plugins/ that hold tracked files. Reading the disk instead
 * would count gitignored output as a plugin: `bun run eval plugins` writes its
 * reports to plugins/evals/results/.
 */
const pluginDirs = [
	...new Set(
		Bun.spawnSync(["git", "ls-files", "-z", "plugins"])
			.stdout.toString()
			.split("\0")
			.map((path) => path.split("/")[1])
			.filter((dir): dir is string => !!dir),
	),
].sort();

const scan = async (pattern: string) => {
	const files: string[] = [];
	for await (const file of new Glob(pattern).scan(".")) {
		files.push(file.split("\\").join("/"));
	}
	return files.sort();
};

const skills = await scan("plugins/*/skills/*/SKILL.md");

type Hook = { type?: string; command?: string };
type HooksFile = {
	hooks?: Record<string, { hooks?: Hook[] }[]>;
};

const hookFiles = await scan("plugins/*/hooks/hooks.json");

const commands = (
	await Promise.all(
		hookFiles.map(async (file) => {
			const parsed: HooksFile = JSON.parse(await readFile(file, "utf8"));
			const pluginRoot = dirname(dirname(file));
			return Object.values(parsed.hooks ?? {})
				.flat()
				.flatMap((group) => group.hooks ?? [])
				.filter((hook) => hook.type === "command")
				.map((hook) => ({ file, pluginRoot, command: hook.command ?? "" }));
		}),
	)
).flat();

/**
 * Upstream copies that markdown-integrity.test.ts also exempts. Reformatting or
 * relinking them would diverge from upstream for no benefit.
 */
const VENDORED = new Set([
	"plugins/ruby-rails/skills/generating-rbs/references/syntax.md",
	"plugins/ruby-rails/skills/generating-rbs/references/data_and_struct.md",
	"plugins/ruby-rails/skills/generating-rbs/references/rbs_by_example.md",
	"plugins/ruby-rails/skills/generating-rbs-inline/references/syntax.md",
	"plugins/ruby-rails/skills/generating-rbs-inline/references/data-struct-support.md",
	"plugins/ruby-rails/skills/generating-sorbet/references/syntax.md",
	"plugins/ruby-rails/skills/generating-sorbet-inline/references/syntax.md",
]);

const markdown = (await scan("plugins/**/*.md")).filter(
	(path) => !VENDORED.has(path) && !path.endsWith("/CHANGELOG.md"),
);

describe("every plugin directory is published", () => {
	test("there are plugin directories to check", () => {
		expect(pluginDirs.length).toBeGreaterThan(published.size - 1);
	});

	test("each directory has a marketplace.json entry or is a known exception", () => {
		const unlisted = pluginDirs.filter(
			(dir) => !published.has(dir) && !UNPUBLISHED.includes(dir),
		);
		expect(unlisted).toEqual([]);
	});

	/** An exception that outlives its reason would hide a real omission. */
	test("each exception is still an unpublished directory", () => {
		const stale = UNPUBLISHED.filter(
			(dir) => !pluginDirs.includes(dir) || published.has(dir),
		);
		expect(stale).toEqual([]);
	});
});

describe("plugin.json carries the required fields", () => {
	const publishedDirs = pluginDirs.filter((dir) => published.has(dir));

	test.each(publishedDirs)("%s", async (dir) => {
		const manifest = JSON.parse(
			await readFile(
				join("plugins", dir, ".claude-plugin", "plugin.json"),
				"utf8",
			),
		);

		expect(manifest.name).toBe(dir);
		expect(manifest.description).toBeString();
		expect(manifest.description.trim()).not.toBe("");
		expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/);
		expect(manifest.license).toBe("BlueOak-1.0.0");
		expect(manifest.author?.name).toBeString();
	});
});

/**
 * A skill with no frontmatter, a name that disagrees with its directory, or an
 * empty description either fails to load or never triggers. Neither shows up
 * as an error anywhere a maintainer would look.
 */
describe("SKILL.md frontmatter", () => {
	const frontmatter = (text: string) => {
		const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
		return match ? (Bun.YAML.parse(match[1]) as Record<string, unknown>) : null;
	};

	test("there are skills to check", () => {
		expect(skills.length).toBeGreaterThan(50);
	});

	test.each(skills)("%s", async (path) => {
		const meta = frontmatter(await readFile(path, "utf8"));

		expect(meta).not.toBeNull();
		expect(meta?.name).toBe(dirname(path).split("/").pop());
		expect(meta?.description).toBeString();
		expect(String(meta?.description).trim()).not.toBe("");
	});
});

/**
 * A hooks.json that points at a missing or non-executable script fails in the
 * user's session, not here. Two command forms are in use: a quoted
 * `"$CLAUDE_PLUGIN_ROOT"/...` path that the shell executes directly, which
 * needs the executable bit, and `bash ${CLAUDE_PLUGIN_ROOT}/...`, which does
 * not.
 */
describe("hooks.json commands resolve to scripts", () => {
	/** Splits a command into the interpreter (if any) and the script it runs. */
	const parse = (command: string) => {
		const match = command.match(
			/^(?:(bash|sh)\s+)?"?\$\{?CLAUDE_PLUGIN_ROOT\}?"?\/(\S+?)"?(?:\s|$)/,
		);
		return match ? { interpreter: match[1], script: match[2] } : null;
	};

	test("there are hook commands to check", () => {
		expect(commands.length).toBeGreaterThan(0);
	});

	test.each(
		commands.map((c) => [`${c.file}: ${c.command}`, c] as const),
	)("%s", (_, { pluginRoot, command }) => {
		const parsed = parse(command);
		expect(parsed).not.toBeNull();
		if (!parsed) return;

		const path = join(pluginRoot, parsed.script);
		expect(existsSync(path)).toBe(true);
		if (!parsed.interpreter) {
			expect(statSync(path).mode & 0o111).not.toBe(0);
		}
	});
});

/**
 * Skills link to their references/ files, and a rename breaks the link without
 * any error. Only authored markdown is checked: the vendored upstream copies
 * that markdown-integrity.test.ts exempts are excluded, as are release-please
 * changelogs. Links inside code fences and inline code are examples, not links.
 */
describe("relative markdown links resolve", () => {
	/** Relative link targets outside code, with any #fragment stripped. */
	const relativeLinks = (text: string) => {
		const prose = text
			.replace(/^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, "")
			.replace(/`[^`\n]*`/g, "");
		return [...prose.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)]
			.map((m) => m[1] ?? "")
			.filter((target) => !/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target))
			.map((target) => decodeURI(target.split("#")[0] ?? ""))
			.filter((target) => target !== "");
	};

	test("there is authored markdown to check", () => {
		expect(markdown.length).toBeGreaterThan(50);
	});

	test.each(markdown)("%s", async (path) => {
		const broken = relativeLinks(await readFile(path, "utf8")).filter(
			(target) => !existsSync(join(dirname(path), target)),
		);
		expect(broken).toEqual([]);
	});
});
