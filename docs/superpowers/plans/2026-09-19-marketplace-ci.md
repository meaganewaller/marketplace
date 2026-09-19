# Marketplace CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate every pull request and push to `main` on lint, shell formatting, the existing test suite, and conventional-commit compliance of the pull request title.

**Architecture:** One workflow, `.github/workflows/ci.yml`, with two jobs split on a real difference in checkout depth: `quality` (shallow, runs on both triggers) and `commit-messages` (full history, pull requests only). The toolchain comes from `jdx/mise-action` reading the existing `mise.lock`, so CI runs the same checksum-verified bun 1.3.14 as the developer. Three pre-existing drift fixes land first so the gate is green the day it arrives.

**Tech Stack:** GitHub Actions, mise, bun 1.3.14, biome, markdownlint-cli2, cspell, knip, tsc, shfmt 3.13.1, commitlint.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-19-marketplace-ci-design.md`. Read it before starting.
- **American English** in every commit message, comment, and document.
- **Every commit goes through `/git-workflow:commit`.** Never hand-write `git commit -m`. If that skill is unavailable, mirror its contract exactly: `<type>(<scope>): <subject> :emoji:`, why-focused body, emoji reflecting *this* change.
- **Do not hand-edit `version` in any `plugin.json`.** release-please owns those.
- GitHub Actions are pinned to a 40-character commit SHA with a trailing `# vX.Y.Z` comment. Repository policy, via `helpers:pinGitHubActionDigests` in `.github/renovate.json5`.
- Indentation is **tabs** for JSON and TypeScript (`biome.json` sets `"indentStyle": "tab"`) and **tabs** for shell (`shfmt -i 0`). Ignore `.editorconfig`, which contradicts this and is a known pre-existing problem.
- Workflow YAML is indented with 4 spaces, matching the existing `.github/workflows/release.yml`.
- Do not run `bd` writes. The beads database has 13 pending schema migrations and writes are blocked; resolving that is a human coordination decision.
- Tests must never drop below the current **241 passing tests across 3 files**.

Resolved action digests, verified on 2026-09-19:

| Action | Tag | SHA |
| --- | --- | --- |
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `jdx/mise-action` | v4.3.0 | `c2a87611a18de5b3828c5652fe268e992400cb5c` |

---

## File Structure

| File | Status | Responsibility |
| --- | --- | --- |
| `plugins/pr-review-copilot/.claude-plugin/plugin.json` | Modify | Existing biome formatting drift |
| `package.json` | Modify | Add `lint:shell` and `fix:shell` to the existing `lint:*` / `fix:*` globs |
| `plugins/example-plugin/hooks/scripts/post-tool-use.sh` | Modify | Missing trailing newline |
| `plugins/example-plugin/hooks/scripts/session-start.sh` | Modify | Missing trailing newline |
| `plugins/mise/hooks/scripts/session-start-check.sh` | Modify | One block indented with spaces |
| `.github/workflows/ci.yml` | Create | The gate itself |
| `test/workflow-integrity.test.ts` | Create | Guards the workflow's own invariants, the way `marketplace-versions.test.ts` guards release-please config |

---

## Task 1: Fix the biome formatting drift on main

`bun run lint` fails on `main` today. Nothing else can be verified until it does not. This task is pure drift correction and touches no policy.

**Files:**
- Modify: `plugins/pr-review-copilot/.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: nothing.
- Produces: a green `bun run lint`, which every later task's verification depends on.

- [ ] **Step 1: Confirm the failure exists and see exactly what biome wants**

```bash
bun run lint:check
```

Expected: FAIL, exit 1. Biome reports `plugins/pr-review-copilot/.claude-plugin/plugin.json format` and shows the `keywords` array being collapsed from five lines onto one.

- [ ] **Step 2: Apply biome's own formatting**

```bash
bun run fix:format
```

- [ ] **Step 3: Confirm the change is the one expected, and only that**

```bash
git diff --stat
git diff plugins/pr-review-copilot/.claude-plugin/plugin.json
```

Expected: exactly one file changed. The `keywords` array becomes
`"keywords": ["code-review", "pull-request", "engineering", "lead-engineer"],`.
If any other file appears in the diff, stop and report it — that means additional
drift exists that the spec did not account for.

- [ ] **Step 4: Verify the whole lint suite is now green**

```bash
bun run lint
```

Expected: PASS, exit 0. All six sub-tasks (`biome`, `knip`, `markdown`, `check`, `spelling`, `types`) succeed.

- [ ] **Step 5: Commit**

Invoke `/git-workflow:commit`. Stage only
`plugins/pr-review-copilot/.claude-plugin/plugin.json`. The message should record
*why* this drifted, not just that it was formatted: `lint-staged` runs
`biome check --write` on staged JSON only, so this landed by a path that skipped
the hook, and nothing has run the full suite since.

---

## Task 2: Add shell formatting to the lint suite

`shfmt` is pinned in `mise.toml` but no script invokes it, so the 7 tracked shell scripts are unchecked. This task makes that pin mean something.

**Files:**
- Modify: `package.json`
- Modify: `plugins/example-plugin/hooks/scripts/post-tool-use.sh`
- Modify: `plugins/example-plugin/hooks/scripts/session-start.sh`
- Modify: `plugins/mise/hooks/scripts/session-start-check.sh`

**Interfaces:**
- Consumes: a green `bun run lint` from Task 1.
- Produces: `bun run lint:shell` (check, exits 1 on drift) and `bun run fix:shell` (rewrite). Because `lint` is `run-p "lint:*"` and `fix` is `run-s "fix:*"`, both are picked up automatically with no change to those two scripts.

- [ ] **Step 1: Add the two scripts to `package.json`**

Insert into `"scripts"`, keeping the existing alphabetical-ish grouping so
`lint:shell` sits with the other `lint:*` entries and `fix:shell` with `fix:*`:

```json
"fix:shell": "git ls-files -z '*.sh' | xargs -0 -r shfmt -i 0 -w",
"lint:shell": "git ls-files -z '*.sh' | xargs -0 -r shfmt -i 0 -d",
```

Three details that matter:
- `-i 0` means tabs. It also suppresses `shfmt`'s `.editorconfig` lookup, which
  would otherwise reflow every script to spaces. Verified: without the flag,
  `shfmt` rewrites all 7 files.
- `-r` stops `xargs` running `shfmt` with no arguments when the glob matches
  nothing. GNU `xargs` on the CI runner needs this; BSD `xargs` on macOS accepts
  it as a no-op.
- `-z` / `-0` handle paths containing spaces.

- [ ] **Step 2: Run the new check and watch it fail**

```bash
bun run lint:shell
```

Expected: FAIL, exit 1. A unified diff naming three files:
- `plugins/example-plugin/hooks/scripts/post-tool-use.sh` — `\ No newline at end of file`
- `plugins/example-plugin/hooks/scripts/session-start.sh` — `\ No newline at end of file`
- `plugins/mise/hooks/scripts/session-start-check.sh` — an `exit 0` indented with two spaces instead of a tab

- [ ] **Step 3: Apply the formatting**

```bash
bun run fix:shell
```

- [ ] **Step 4: Confirm only those three files changed**

```bash
git diff --stat
```

Expected: exactly 3 shell files, plus `package.json` from Step 1. If a fourth
shell file appears, `-i 0` was omitted and `.editorconfig` took over — revert and
re-check Step 1.

- [ ] **Step 5: Verify the check now passes, and the full suite with it**

```bash
bun run lint:shell
bun run lint
bun test
```

Expected: all three PASS. `bun test` still reports 241 pass, 0 fail across 3 files.

- [ ] **Step 6: Commit**

Invoke `/git-workflow:commit`. Stage `package.json` and the three shell scripts.
The message should explain that `shfmt` was already pinned but unenforced, and
that `-i 0` is deliberate because `.editorconfig` disagrees with `biome.json`.

---

## Task 3: Add the CI workflow and a test that guards it

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `test/workflow-integrity.test.ts`

**Interfaces:**
- Consumes: `bun run lint` (now including `lint:shell`) and `bun test`, both green from Tasks 1 and 2.
- Produces: nothing later in this plan depends on it. This is the terminal task.

- [ ] **Step 1: Write the failing test**

This repository already guards its configuration with tests —
`marketplace-versions.test.ts` guards `release-please-config.json`,
`markdown-integrity.test.ts` guards `.markdownlint-cli2.yaml`. The workflow gets
the same treatment, so the pinning policy is enforced by something other than
memory.

Create `test/workflow-integrity.test.ts`:

```typescript
import { describe, expect, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";
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

	test.each(["ci.yml"])("%s records the version each SHA stands for", async (name) => {
		const text = await readWorkflow(name);
		const uncommented = text
			.split("\n")
			.filter((line) => /uses:\s*\S+@[0-9a-f]{40}/.test(line))
			.filter((line) => !/#\s*v\d+\.\d+\.\d+/.test(line))
			.map((line) => line.trim());
		expect(uncommented).toEqual([]);
	});
});
```

- [ ] **Step 2: Run the test and watch it fail**

```bash
bun test test/workflow-integrity.test.ts
```

Expected: FAIL. `ci.yml is present` fails first because the file does not exist;
the tests that read it throw ENOENT.

- [ ] **Step 3: Write the workflow**

Create `.github/workflows/ci.yml`. Note the 4-space indentation, matching
`release.yml`:

```yaml
name: CI

concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

on:
    pull_request:
        branches:
            - main
    push:
        branches:
            - main

permissions:
    contents: read

jobs:
    quality:
        name: Lint and test
        runs-on: ubuntu-latest
        steps:
            - name: Check out the repository
              uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

            # mise.lock pins bun to 1.3.14 with per-platform checksums, so CI
            # resolves the same toolchain the developer runs.
            - name: Install the pinned toolchain
              uses: jdx/mise-action@c2a87611a18de5b3828c5652fe268e992400cb5c # v4.3.0

            - name: Install dependencies
              id: install
              run: bun install --frozen-lockfile

            - name: Lint
              run: bun run lint

            # Lint takes 0.3s and the tests 0.3s, so the job's cost is checkout
            # plus install. Report both results from one run rather than making
            # a lint failure hide the test outcome — but stay skipped if the
            # install itself never succeeded, where a test failure would be noise.
            - name: Test
              if: ${{ !cancelled() && steps.install.outcome == 'success' }}
              run: bun test

    commit-messages:
        name: Commit messages
        if: github.event_name == 'pull_request'
        runs-on: ubuntu-latest
        steps:
            - name: Check out the full history
              uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
              with:
                  fetch-depth: 0

            - name: Install the pinned toolchain
              uses: jdx/mise-action@c2a87611a18de5b3828c5652fe268e992400cb5c # v4.3.0

            - name: Install dependencies
              run: bun install --frozen-lockfile

            # This repository squash-merges, so the commit that lands on main is
            # the squash subject, which GitHub seeds from the pull request title.
            # That is the string release-please reads to pick the next version:
            # a `chore:` title silently suppresses a release that should ship.
            # The title reaches the shell through the environment because a
            # `${{ }}` expansion inside `run:` would make it executable.
            - name: Lint the pull request title
              env:
                  PR_TITLE: ${{ github.event.pull_request.title }}
              run: printf '%s\n' "$PR_TITLE" | bun run commitlint

            - name: Lint the commits
              env:
                  BASE_REF: ${{ github.base_ref }}
              run: bun run commitlint -- --from "origin/$BASE_REF" --to HEAD
```

- [ ] **Step 4: Run the test and verify it passes**

```bash
bun test test/workflow-integrity.test.ts
```

Expected: PASS, all tests green.

- [ ] **Step 5: Run every command the workflow will run, locally**

A workflow cannot be fully exercised before GitHub runs it, so each command it
invokes is verified by hand first:

```bash
bun install --frozen-lockfile
bun run lint
bun test
printf '%s\n' "feat(ci): gate pull requests on lint and tests :construction_worker:" | bun run commitlint
bun run commitlint -- --from origin/main --to HEAD
```

Expected: every command exits 0. The last one may print warnings; warnings do
not fail commitlint. If `bun install --frozen-lockfile` fails, `bun.lock` is out
of date with `package.json` — that is a real finding from Task 2's edit, so fix
the lockfile rather than dropping the flag.

- [ ] **Step 6: Verify the full suite one last time**

```bash
bun run lint && bun test
```

Expected: PASS. Test count is now above 241, since this task added tests.

- [ ] **Step 7: Commit**

Invoke `/git-workflow:commit`. Stage `.github/workflows/ci.yml` and
`test/workflow-integrity.test.ts`. The message should say why the pull request
title is linted rather than only the commits.

---

## Self-review notes

Checked against the spec:

| Spec item | Task |
| --- | --- |
| `ci.yml` on pull request and push, `contents: read`, concurrency | 3 |
| Two jobs split on checkout depth | 3 |
| `if: always()`-style single-run reporting | 3, refined to `!cancelled() && steps.install.outcome` so an install failure does not produce a confusing test failure |
| commitlint on pull request title and commits, title via `env:` | 3 |
| `shfmt -i 0`, `lint:shell` and `fix:shell` | 2 |
| Three drift fixes | 1 (biome) and 2 (three shell files) |
| mise-action toolchain | 3 |
| SHA-pinned actions with version comments | 3, plus `test/workflow-integrity.test.ts` enforcing it |

**One deviation from the spec, flagged for the reviewer:** the spec listed no new
tests, but Task 3 adds `test/workflow-integrity.test.ts`. The workflow is
configuration, and this repository's established pattern is to guard
configuration with tests. Without it, the SHA-pinning policy and the
`PR_TITLE`-through-`env` safety property survive only as long as someone
remembers them.

That test deliberately scopes its pinning assertions to `ci.yml` via
`test.each(["ci.yml"])` rather than globbing every workflow, because
`release.yml` uses a bare `@v4` and pinning it is out of scope per the spec.
**If you would rather sweep `release.yml` in**, change both `test.each(["ci.yml"])`
calls to `test.each(workflowFiles)` and pin
`google-github-actions/release-please-action` to a SHA in the same commit. That
is the better end state; it was simply not what the spec authorized.

## Follow-up, not in this plan

Recorded in the spec and repeated here. File as beads once the database's 13
pending schema migrations are reconciled by the designated migrator.

1. Nothing catches a plugin directory absent from `marketplace.json` — 12 directories, 11 published entries, and only listed-implies-exists is tested.
2. `plugin.json` required-field validity and name-matches-directory.
3. `SKILL.md` frontmatter present, `name` matching its directory, `description` non-empty.
4. Hook scripts referenced from `hooks.json` resolve on disk.
5. Relative markdown links between skills and their `references/` resolve.
6. `.editorconfig` contradicts `biome.json` for every file type.
7. `release.yml` uses an unpinned `@v4` against the repository's own Renovate policy.
8. `.beads.gate.lock` is untracked and unignored.
