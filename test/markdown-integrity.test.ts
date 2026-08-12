import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { Glob } from "bun";

/**
 * A STRUCTURE.md once had ten code fences and not one bare closing fence —
 * every closer carried an info string. CommonMark only ends a fenced block on
 * a fence with no info string, so the block opened on line 15 ran to the end of
 * the file and swallowed 187 of its 202 lines, including eleven headings.
 *
 * The lint gate could not have caught it. The markdownlint ignores used
 * `references/**` to skip upstream documentation copied verbatim, but
 * markdownlint only ever globs `.md`, and every `.md` inside those corpora is
 * navigation we wrote ourselves. The exclusions were doing nothing except
 * hiding our own content.
 *
 * These tests guard both halves: authored markdown closes its fences, and no
 * ignore pattern can shadow a file we authored.
 */

/**
 * Upstream documentation copied verbatim from ruby/rbs, rbs-inline, and
 * sorbet.org. Reformatting these would create churn against upstream for no
 * benefit, so they are the one set the lint config may legitimately skip.
 */
const VENDORED_COPIES = [
	"plugins/ruby-rails/skills/generating-rbs/references/syntax.md",
	"plugins/ruby-rails/skills/generating-rbs/references/data_and_struct.md",
	"plugins/ruby-rails/skills/generating-rbs/references/rbs_by_example.md",
	"plugins/ruby-rails/skills/generating-rbs-inline/references/syntax.md",
	"plugins/ruby-rails/skills/generating-rbs-inline/references/data-struct-support.md",
	"plugins/ruby-rails/skills/generating-sorbet/references/syntax.md",
	"plugins/ruby-rails/skills/generating-sorbet-inline/references/syntax.md",
];

/** Written by release-please, not by hand. */
const isGenerated = (path: string) => path.endsWith("/CHANGELOG.md");

const authoredMarkdown: string[] = [];
for await (const file of new Glob("plugins/**/*.md").scan(".")) {
	const path = file.split("\\").join("/");
	if (VENDORED_COPIES.includes(path) || isGenerated(path)) continue;
	authoredMarkdown.push(path);
}
authoredMarkdown.sort();

/**
 * Returns the 1-indexed line of an unclosed fence, or null when every block
 * closes. A closing fence must repeat the opener's character, be at least as
 * long, and carry no info string — the rule the broken file violated.
 */
function unclosedFenceLine(text: string): number | null {
	type Fence = { char: string; length: number; line: number };
	let open: Fence | null = null;
	const lines = text.split("\n");

	for (let index = 0; index < lines.length; index++) {
		const match = lines[index].match(/^\s*(`{3,}|~{3,})(.*)$/);
		if (!match) continue;

		const [, marker, info] = match;
		const char = marker[0];

		if (open === null) {
			// An info string on a backtick fence may not itself contain backticks.
			if (char === "`" && info.includes("`")) continue;
			open = { char, length: marker.length, line: index + 1 };
			continue;
		}

		const closes =
			char === open.char && marker.length >= open.length && info.trim() === "";
		if (closes) open = null;
	}

	return open === null ? null : open.line;
}

/** The flat `- 'pattern'` list under `ignores:` in .markdownlint-cli2.yaml. */
function parseIgnores(yaml: string): string[] {
	const lines = yaml.split("\n");
	const start = lines.findIndex((l) => l.trimEnd() === "ignores:");
	if (start === -1) return [];

	const patterns: string[] = [];
	for (const line of lines.slice(start + 1)) {
		if (/^\S/.test(line)) break; // dedent ends the block
		const entry = line.match(/^\s+-\s+(.+?)\s*(?:#.*)?$/);
		if (entry) patterns.push(entry[1].replace(/^['"]|['"]$/g, ""));
	}
	return patterns;
}

describe("authored markdown closes its code fences", () => {
	test("there is authored markdown to check", () => {
		expect(authoredMarkdown.length).toBeGreaterThan(50);
	});

	test.each(authoredMarkdown)("%s", async (path) => {
		const line = unclosedFenceLine(await readFile(path, "utf8"));
		expect(line).toBeNull();
	});
});

const ignores = parseIgnores(await readFile(".markdownlint-cli2.yaml", "utf8"));

describe("lint exclusions cannot shadow authored files", () => {
	test("the ignores block parses", () => {
		expect(ignores.length).toBeGreaterThan(0);
	});

	test("no ignore pattern matches a file we wrote", () => {
		const shadowed = ignores.flatMap((pattern) => {
			const glob = new Glob(pattern);
			return authoredMarkdown
				.filter((path) => glob.match(path))
				.map((path) => `${pattern} shadows ${path}`);
		});
		expect(shadowed).toEqual([]);
	});

	test("every vendored copy is actually excluded", () => {
		const unmatched = VENDORED_COPIES.filter(
			(path) => !ignores.some((pattern) => new Glob(pattern).match(path)),
		);
		expect(unmatched).toEqual([]);
	});
});
