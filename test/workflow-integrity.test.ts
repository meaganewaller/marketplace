import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Renovate is configured with `helpers:pinGitHubActionDigests`, so every action
 * this repository uses is meant to be pinned to a commit SHA rather than a
 * mutable tag. A tag can be moved to point at different code after review;
 * a SHA cannot. Renovate advances these pins, but nothing until now checked
 * that a hand-written workflow honored the policy in the first place.
 */

const WORKFLOW_DIR = ".github/workflows";

const workflowFiles = (await readdir(WORKFLOW_DIR))
	.filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
	.sort();

const readWorkflow = (name: string) =>
	readFile(join(WORKFLOW_DIR, name), "utf8");

/** Every `uses:` value in a workflow, with the line it appeared on. */
function actionReferences(text: string): { ref: string; line: number }[] {
	const found: { ref: string; line: number }[] = [];
	const lines = text.split("\n");
	for (let index = 0; index < lines.length; index++) {
		const match = lines[index].match(/^\s*-?\s*uses:\s*(\S+)/);
		if (match) found.push({ ref: match[1], line: index + 1 });
	}
	return found;
}

describe("the CI workflow exists and gates the right things", () => {
	test("ci.yml is present", () => {
		expect(workflowFiles).toContain("ci.yml");
	});

	test("it runs the full lint suite and the tests", async () => {
		const ci = await readWorkflow("ci.yml");
		expect(ci).toContain("bun run lint");
		expect(ci).toContain("bun test");
	});

	/**
	 * This repository squash-merges, so the string release-please reads to
	 * decide the next version is the squash subject — seeded from the pull
	 * request title, not from any individual commit. Linting the commits alone
	 * would leave that string unchecked.
	 */
	test("it lints the pull request title, not only the commits", async () => {
		const ci = await readWorkflow("ci.yml");
		expect(ci).toContain("PR_TITLE");
		expect(ci).toContain("--from");
	});

	/**
	 * A `${{ }}` expansion inside a `run:` block splices a pull request title
	 * into shell. The title must reach the script through the environment.
	 */
	test("the pull request title is never interpolated into a run block", async () => {
		const ci = await readWorkflow("ci.yml");
		const interpolated = ci
			.split("\n")
			.filter((line) => /\$\{\{[^}]*pull_request\.title/.test(line))
			.filter((line) => !/^\s*PR_TITLE:/.test(line));
		expect(interpolated).toEqual([]);
	});

	test("it installs with a frozen lockfile", async () => {
		const ci = await readWorkflow("ci.yml");
		expect(ci).toContain("--frozen-lockfile");
	});

	test("it grants no more than read access to contents", async () => {
		const ci = await readWorkflow("ci.yml");
		expect(ci).toContain("contents: read");
	});
});

describe("actions are pinned to immutable commits", () => {
	test("there are workflows to check", () => {
		expect(workflowFiles.length).toBeGreaterThan(0);
	});

	test.each(["ci.yml"])("%s pins every action to a SHA", async (name) => {
		const references = actionReferences(await readWorkflow(name));
		expect(references.length).toBeGreaterThan(0);

		const unpinned = references
			.filter(({ ref }) => !/@[0-9a-f]{40}$/.test(ref))
			.map(({ ref, line }) => `${name}:${line} ${ref}`);
		expect(unpinned).toEqual([]);
	});

	test.each([
		"ci.yml",
	])("%s records the version each SHA stands for", async (name) => {
		const text = await readWorkflow(name);
		const uncommented = text
			.split("\n")
			.filter((line) => /uses:\s*\S+@[0-9a-f]{40}/.test(line))
			.filter((line) => !/#\s*v\d+\.\d+\.\d+/.test(line))
			.map((line) => line.trim());
		expect(uncommented).toEqual([]);
	});
});
