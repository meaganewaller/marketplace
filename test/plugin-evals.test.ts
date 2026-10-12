import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { Glob } from "bun";

/**
 * Static checks for the `claude plugin eval` suites under plugins/<name>/evals/.
 *
 * Running a suite is a paid, nondeterministic model call, so it stays a manual
 * step (see README.md). These checks are the free half: they fail when a case
 * would not load (an unknown frontmatter key, a grader with no type, a regex
 * that doesn't compile) or when a skill rename leaves a trigger grader pointing
 * at a skill that no longer exists, which a paid run would only report as a
 * quietly failing case.
 *
 * The format follows https://code.claude.com/docs/en/plugin-evals.
 */

const ROOT = resolve(import.meta.dir, "..");

/** prompt.md frontmatter keys the eval loader accepts; any other key is an error. */
const PROMPT_KEYS = new Set([
	"schema_version",
	"name",
	"description",
	"tags",
	"plugins",
	"runs",
	"expected_outcome",
	"model",
	"max_turns",
	"timeout_seconds",
	"allowed_tools",
	"append_system_prompt",
	"env",
]);

/** Grader keys shared by every type, plus each type's own options. */
const GRADER_COMMON = ["type", "weight", "arm"];
const GRADER_KEYS: Record<string, string[]> = {
	regex: ["pattern", "flags", "match", "target"],
	tool_used: ["tool", "input_match", "min", "max"],
	tool_order: ["before", "after"],
	file_exists: ["path", "exists"],
	llm: ["criteria", "focus"],
	baseline: ["baseline_file", "criteria"],
};

/** `"skill"\s*:\s*"(?:<plugin>:)?<skill>"`, the shape every Skill grader here uses. */
const SKILL_MATCH = /^"skill"\\s\*:\\s\*"\(\?:([\w-]+):\)\?([\w-]+)"$/;

type Frontmatter = Record<string, unknown>;

function splitFrontmatter(text: string): { data: Frontmatter; body: string } {
	const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { data: {}, body: text };
	return {
		data: (Bun.YAML.parse(match[1]) ?? {}) as Frontmatter,
		body: match[2],
	};
}

type Grader = { file: string; data: Frontmatter };
type Case = {
	dir: string;
	plugin: string;
	data: Frontmatter;
	body: string;
	graders: Grader[];
};

const cases: Case[] = [];
for await (const file of new Glob("plugins/*/evals/**/prompt.md").scan(ROOT)) {
	const path = file.split("\\").join("/");
	if (path.includes("/results/")) continue;
	const dir = join(ROOT, dirname(path));
	const { data, body } = splitFrontmatter(
		await readFile(join(ROOT, path), "utf8"),
	);
	const graderDir = join(dir, "graders");
	const graders: Grader[] = [];
	if (existsSync(graderDir)) {
		for (const name of readdirSync(graderDir).filter((f) =>
			f.endsWith(".md"),
		)) {
			const text = await readFile(join(graderDir, name), "utf8");
			graders.push({ file: name, data: splitFrontmatter(text).data });
		}
	}
	cases.push({ dir, plugin: path.split("/")[1], data, body, graders });
}
cases.sort((a, b) => a.dir.localeCompare(b.dir));

const label = (c: Case) => relative(ROOT, c.dir);

/** Plugin directories a case loads: its `plugins` list, else the enclosing plugin. */
function loadedPlugins(c: Case): string[] {
	const dirs = (c.data.plugins as string[] | undefined) ?? [];
	if (dirs.length === 0) return [c.plugin];
	return dirs.map((d) => basename(resolve(c.dir, d)));
}

describe("plugin eval suites", () => {
	test("found at least one case", () => {
		expect(cases.length).toBeGreaterThan(0);
	});

	test("case names are unique within each plugin", () => {
		const seen = new Map<string, string>();
		const dupes: string[] = [];
		for (const c of cases) {
			const key = `${c.plugin}/${(c.data.name as string) ?? basename(c.dir)}`;
			if (seen.has(key)) dupes.push(`${label(c)} duplicates ${seen.get(key)}`);
			seen.set(key, label(c));
		}
		expect(dupes).toEqual([]);
	});

	for (const c of cases) {
		describe(label(c), () => {
			test("prompt.md uses only known frontmatter keys and has a prompt", () => {
				expect(Object.keys(c.data).filter((k) => !PROMPT_KEYS.has(k))).toEqual(
					[],
				);
				expect(c.body.trim().length).toBeGreaterThan(0);
			});

			test("plugins entries resolve to plugin directories", () => {
				const dirs = (c.data.plugins as string[] | undefined) ?? [];
				const missing = dirs.filter(
					(d) =>
						!existsSync(join(resolve(c.dir, d), ".claude-plugin/plugin.json")),
				);
				expect(missing).toEqual([]);
			});

			test("has graders that would load", () => {
				expect(c.graders.length).toBeGreaterThan(0);
				for (const g of c.graders) {
					const type = g.data.type as string;
					expect(Object.keys(GRADER_KEYS)).toContain(type);
					const allowed = new Set([...GRADER_COMMON, ...GRADER_KEYS[type]]);
					expect(Object.keys(g.data).filter((k) => !allowed.has(k))).toEqual(
						[],
					);
					if (typeof g.data.input_match === "string")
						expect(
							() => new RegExp(g.data.input_match as string),
						).not.toThrow();
				}
			});

			test("Skill graders name a skill the case actually loads", () => {
				for (const g of c.graders) {
					if (g.data.type !== "tool_used" || g.data.tool !== "Skill") continue;
					const pattern = g.data.input_match as string;
					const parts = pattern.match(SKILL_MATCH);
					expect(
						parts,
						`${g.file}: unexpected input_match shape`,
					).not.toBeNull();
					const [, plugin, skill] = parts as RegExpMatchArray;

					expect(
						existsSync(
							join(ROOT, "plugins", plugin, "skills", skill, "SKILL.md"),
						),
						`${g.file}: ${plugin}:${skill} has no SKILL.md`,
					).toBe(true);
					expect(loadedPlugins(c)).toContain(plugin);

					// The pattern must match its own skill and no sibling, in both
					// the namespaced and bare forms the Skill tool may send.
					const re = new RegExp(pattern);
					expect(re.test(JSON.stringify({ skill: `${plugin}:${skill}` }))).toBe(
						true,
					);
					expect(re.test(JSON.stringify({ skill }))).toBe(true);
					for (const other of readdirSync(
						join(ROOT, "plugins", plugin, "skills"),
					)) {
						if (other === skill) continue;
						expect(
							re.test(JSON.stringify({ skill: `${plugin}:${other}` })),
						).toBe(false);
					}
				}
			});
		});
	}

	test("every skill in a plugin with evals has trigger and near-miss cases", () => {
		const gaps: string[] = [];
		for (const plugin of new Set(cases.map((c) => c.plugin))) {
			const own = cases.filter((c) => c.plugin === plugin);
			for (const skill of readdirSync(
				join(ROOT, "plugins", plugin, "skills"),
			)) {
				for (const kind of ["trigger", "near-miss"]) {
					const hit = own.some((c) => {
						const tags = (c.data.tags as string[] | undefined) ?? [];
						return tags.includes(kind) && tags.includes(skill);
					});
					if (!hit) gaps.push(`${plugin}:${skill} has no ${kind} case`);
				}
			}
		}
		expect(gaps).toEqual([]);
	});
});
