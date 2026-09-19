import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * These checks assert against the *parsed* workflow rather than its raw text.
 * The difference is not cosmetic. An earlier version of this file matched
 * substrings over the whole file, and a workflow that ran nothing — every
 * asserted string moved into a leading comment, `if: false` on the only job,
 * and `contents: write` granted to itself — satisfied all of it. Comments and
 * structure are indistinguishable to `toContain`.
 *
 * Renovate is configured with `helpers:pinGitHubActionDigests`, so every action
 * this repository uses is meant to be pinned to a commit SHA rather than a
 * mutable tag. A tag can be moved to point at different code after review;
 * a SHA cannot. Renovate advances these pins, but nothing until now checked
 * that a hand-written workflow honored the policy in the first place.
 *
 * Scope is deliberately `ci.yml` alone. `release.yml` uses a bare `@v4`, and
 * pinning it is a separate decision that has been made and deferred.
 */

const WORKFLOW_DIR = ".github/workflows";

type Step = {
	name?: string;
	id?: string;
	uses?: string;
	run?: string;
	if?: string;
	env?: Record<string, string>;
	with?: Record<string, unknown>;
};

type Job = {
	name?: string;
	if?: string;
	permissions?: unknown;
	steps?: Step[];
};

type Workflow = {
	on?: {
		pull_request?: { types?: string[]; branches?: string[] };
		push?: { branches?: string[] };
	};
	concurrency?: { group?: string; "cancel-in-progress"?: unknown };
	permissions?: Record<string, string>;
	jobs?: Record<string, Job>;
};

const workflowFiles = (await readdir(WORKFLOW_DIR))
	.filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
	.sort();

const readWorkflow = (name: string) =>
	readFile(join(WORKFLOW_DIR, name), "utf8");

const parseWorkflow = async (name: string) =>
	Bun.YAML.parse(await readWorkflow(name)) as Workflow;

const ci = await parseWorkflow("ci.yml");

/** Every step of every job, tagged with the job that declared it. */
function allSteps(workflow: Workflow): { job: string; step: Step }[] {
	return Object.entries(workflow.jobs ?? {}).flatMap(([job, definition]) =>
		(definition.steps ?? []).map((step) => ({ job, step })),
	);
}

const stepsOf = (job: string) => ci.jobs?.[job]?.steps ?? [];

/** Describe a step for a failure message, falling back to what it runs. */
const label = (job: string, step: Step) =>
	`${job}: ${step.name ?? step.uses ?? step.run ?? "<unnamed>"}`;

describe("the CI workflow runs on the events that matter", () => {
	test("ci.yml is present", () => {
		expect(workflowFiles).toContain("ci.yml");
	});

	/**
	 * `edited` carries the weight here. This repository squash-merges and
	 * release-please reads the resulting subject, which GitHub seeds from the
	 * pull request title. Without a rerun on `edited`, a pull request can pass
	 * CI under a good title and then be renamed to `chore:` before merge — the
	 * stale green check stands and the release is silently suppressed.
	 */
	test("it reruns when a pull request title is edited", () => {
		const types = ci.on?.pull_request?.types ?? [];
		expect(types).toContain("edited");
		expect(types).toContain("opened");
		expect(types).toContain("synchronize");
		expect(types).toContain("reopened");
	});

	test("it gates pull requests into main and pushes to main", () => {
		expect(ci.on?.pull_request?.branches).toContain("main");
		expect(ci.on?.push?.branches).toContain("main");
	});

	/**
	 * The concurrency group collapses to one key per ref, so on `main` every
	 * merge shares it. Cancelling there would throw away the green record for
	 * a commit that is already merged; cancelling a superseded pull request
	 * run, which a force-push has made meaningless, is the case worth having.
	 */
	test("it cancels superseded runs only on pull requests", () => {
		const cancel = String(ci.concurrency?.["cancel-in-progress"] ?? "");
		expect(cancel).toContain("github.event_name == 'pull_request'");
	});
});

describe("the CI workflow grants no more access than it needs", () => {
	test("the workflow itself gets read access to contents and nothing else", () => {
		expect(ci.permissions).toEqual({ contents: "read" });
	});

	/**
	 * A job-level `permissions` block replaces the workflow-level one outright
	 * rather than narrowing it, so a job can quietly grant itself
	 * `contents: write`. Asserting the block is absent is the check that a
	 * substring search for "contents: read" could never make.
	 */
	test("no job widens the workflow permissions", () => {
		const widened = Object.entries(ci.jobs ?? {})
			.filter(([, job]) => job.permissions !== undefined)
			.map(([name]) => name);
		expect(widened).toEqual([]);
	});

	/**
	 * `bun install` runs the root `prepare` script, which a pull request author
	 * can change. The job token must not be sitting in `.git/config` when it
	 * does.
	 */
	test("no checkout leaves the job token behind in .git/config", () => {
		const leaky = allSteps(ci)
			.filter(({ step }) => step.uses?.startsWith("actions/checkout@"))
			.filter(({ step }) => step.with?.["persist-credentials"] !== false)
			.map(({ job, step }) => label(job, step));
		expect(leaky).toEqual([]);
	});
});

describe("the quality job runs the lint suite and the tests", () => {
	test("a step runs the full lint suite", () => {
		const linting = stepsOf("quality").filter((step) =>
			step.run?.includes("bun run lint"),
		);
		expect(linting).toHaveLength(1);
	});

	test("a step runs the tests", () => {
		const testing = stepsOf("quality").filter((step) =>
			step.run?.includes("bun test"),
		);
		expect(testing).toHaveLength(1);
	});

	test("it installs with a frozen lockfile from a step the tests can key off", () => {
		const install = stepsOf("quality").find((step) => step.id === "install");
		expect(install).toBeDefined();
		expect(install?.run).toContain("--frozen-lockfile");
	});

	/**
	 * The tests run even after a lint failure, so both results come back from
	 * one run — but stay skipped when the install never succeeded, where a test
	 * failure would only be noise.
	 *
	 * `!cancelled()` must survive parsing intact. A leading `!` is a YAML tag
	 * indicator: written unquoted and without the `${{ }}` wrapper, the
	 * condition parses as the tag `!cancelled()` applied to the remainder, and
	 * the negation vanishes with no error anywhere.
	 */
	test("the tests are skipped only when the install never succeeded", () => {
		const testing = stepsOf("quality").find((step) =>
			step.run?.includes("bun test"),
		);
		expect(testing?.if).toContain("steps.install.outcome == 'success'");
		expect(testing?.if).toContain("!cancelled()");
	});
});

describe("the commit-messages job checks the release-deciding string", () => {
	/**
	 * A `${{ }}` expansion inside `run:` splices its value straight into the
	 * shell, and a pull request title is text an outside contributor writes.
	 * Asserting over parsed `run` strings catches an expression spread across
	 * several lines of a block scalar, which a line-by-line regex does not.
	 */
	test("no run block interpolates a workflow expression", () => {
		const interpolated = allSteps(ci)
			.filter(({ step }) => step.run?.includes("${{"))
			.map(({ job, step }) => label(job, step));
		expect(interpolated).toEqual([]);
	});

	test("the pull request title reaches commitlint through the environment", () => {
		const titled = stepsOf("commit-messages").find(
			(step) => step.env?.PR_TITLE !== undefined,
		);
		expect(titled).toBeDefined();
		expect(titled?.env?.PR_TITLE).toContain("github.event.pull_request.title");
		expect(titled?.run).toContain("$PR_TITLE");
		expect(titled?.run).toContain("commitlint");
	});

	test("it lints the commit range as well as the title", () => {
		const ranged = stepsOf("commit-messages").find((step) =>
			step.run?.includes("--from"),
		);
		expect(ranged?.run).toContain("commitlint");
	});

	/** A commit range needs history that a shallow checkout does not have. */
	test("it checks out the full history", () => {
		const checkout = stepsOf("commit-messages").find((step) =>
			step.uses?.startsWith("actions/checkout@"),
		);
		expect(checkout?.with?.["fetch-depth"]).toBe(0);
	});

	test("it runs only on pull requests, where a commit range exists", () => {
		expect(ci.jobs?.["commit-messages"]?.if).toContain(
			"github.event_name == 'pull_request'",
		);
	});
});

describe("actions are pinned to immutable commits", () => {
	test("there are workflows to check", () => {
		expect(workflowFiles.length).toBeGreaterThan(0);
	});

	test.each(["ci.yml"])("%s pins every action to a SHA", async (name) => {
		const used = allSteps(await parseWorkflow(name)).filter(
			({ step }) => step.uses,
		);
		expect(used.length).toBeGreaterThan(0);

		const unpinned = used
			.filter(({ step }) => !/@[0-9a-f]{40}$/.test(step.uses ?? ""))
			.map(({ job, step }) => `${name} ${job}: ${step.uses}`);
		expect(unpinned).toEqual([]);
	});

	/**
	 * This one check stays text-based on purpose, unlike every other check in
	 * this file. The `# vX.Y.Z` annotation beside each SHA is a YAML comment,
	 * and parsing discards comments — there is no parsed structure to assert it
	 * from. Do not "fix" this to match the structural checks above.
	 */
	test.each([
		"ci.yml",
	])("%s records the version each SHA stands for", async (name) => {
		const text = await readWorkflow(name);
		const uncommented = text
			.split("\n")
			.filter((line) => /uses:\s*\S+@[0-9a-f]{40}/.test(line))
			.filter((line) => !/#\s*v\d+(\.\d+)*/.test(line))
			.map((line) => line.trim());
		expect(uncommented).toEqual([]);
	});
});
