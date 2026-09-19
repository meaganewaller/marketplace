# Continuous integration for the marketplace

Date: 2026-09-19
Status: approved, not yet implemented

## Problem

Nothing verifies this repository before a change reaches `main`.

The only workflow is `.github/workflows/release.yml`, which runs release-please
on push. It publishes; it does not check. Locally, husky's `pre-commit` hook
runs `lint-staged`, which touches only *staged* files and never runs
`lint:types`, `lint:knip`, or `bun test` at all.

The gap is not theoretical. At the time of writing, `bun run lint` fails on
`main`: `plugins/pr-review-copilot/.claude-plugin/plugin.json` carries a
`keywords` array that biome would collapse onto one line. `lint-staged` runs
`biome check --write` on JSON, so this drift landed by a path that skipped the
hook. No gate has noticed since.

The suite is small but real: 241 tests across 3 files, running in 254ms.

## Decisions

### Gate scope

`bun run lint` and `bun test`, plus two additions:

- **shfmt** over the tracked shell scripts. `shfmt` is already pinned in
  `mise.toml`, but no script invokes it, so the 7 tracked shell scripts under
  `plugins/` (6 hook scripts, plus one shipped with the bun skill) are
  unchecked. The pin currently means nothing.
- **commitlint** over pull requests. See below.

`bun install --frozen-lockfile` is how CI installs. That is install hygiene,
not a gate.

### commitlint targets the pull request title, not only its commits

This repository squash-merges. Recent history carries the `(#45)`, `(#44)`,
`(#43)` suffix and contains no merge commits since #12.

Under squash-merge, the commit that lands on `main` is the squash subject,
which GitHub seeds from the **pull request title**. That subject is the string
release-please reads to decide the next version. A `chore:` title silently
suppresses a release that should have shipped, and nothing recovers it
afterward.

Linting only the individual commits would therefore leave the one
release-deciding string unchecked. CI lints both, and the title is the check
that carries the weight.

The title is passed through `env:` rather than interpolated into `run:`
directly. A `${{ }}` expansion inside a shell step turns a pull request title
into executable shell.

### shfmt uses tabs, overriding .editorconfig

`shfmt` consults `.editorconfig` when given no formatting flags.
`.editorconfig` here declares `indent_style = space`, but `biome.json` sets
`"indentStyle": "tab"`, and the shell scripts — along with every JSON and
TypeScript file in the repository — are tab-indented.

Editorconfig-driven `shfmt` would therefore reflow those scripts from tabs to
spaces: a large diff, in the direction that disagrees with the rest of the
repository. Passing `-i 0` explicitly selects tabs and suppresses the
`.editorconfig` lookup, which keeps the check deterministic and the diff to
three small fixes.

That `.editorconfig` contradicts `biome.json` for every file type is a real
problem, but a pre-existing one. It is out of scope here.

### Workflow shape

One workflow, `.github/workflows/ci.yml`, on `pull_request` targeting `main`
and `push` to `main`. `permissions: contents: read`. `concurrency` cancels
superseded runs so a force-push does not leave a runner going.

Two jobs, split on a real difference in what they need rather than for
appearance:

| Job | Trigger | Rationale |
| --- | --- | --- |
| `quality` | pull request and push | Shallow checkout suffices |
| `commit-messages` | pull request only | Needs `fetch-depth: 0` for the commit range; has no meaning on push |

Within `quality`, steps after the first failure carry `if: always()`. Lint
takes 0.31s and the tests 0.25s, so the entire job duration is checkout plus
install. Paying that a second time to discover that the tests also failed
would be waste.

### Toolchain comes from mise

`mise.lock` already pins bun to 1.3.14 with per-platform checksums, and that is
the bun running locally. `jdx/mise-action` therefore gives CI a
checksum-verified toolchain identical to the developer's, with no version
duplicated outside `mise.toml`.

### Actions are pinned to digests

`.github/renovate.json5` extends `helpers:pinGitHubActionDigests` and
`:automergeDigest`. The new workflow follows that policy: SHA-pinned actions
with a `# vX.Y.Z` trailing comment, left to Renovate to advance.

`release.yml` uses a bare `@v4`, inconsistent with the same policy. Deliberately
left alone; noted under follow-up.

## Scope

In scope:

1. `.github/workflows/ci.yml` as described.
2. `lint:shell` and `fix:shell` scripts in `package.json`, named to join the
   existing `run-p "lint:*"` and `run-s "fix:*"` globs automatically.
3. Three mechanical fixes so `main` is green when the gate arrives. A gate that
   is red on its first run teaches everyone to ignore it.
   - `plugins/pr-review-copilot/.claude-plugin/plugin.json`: biome formatting.
   - `plugins/example-plugin/hooks/scripts/post-tool-use.sh` and
     `session-start.sh`: no trailing newline.
   - `plugins/mise/hooks/scripts/session-start-check.sh`: one block indented
     with spaces rather than tabs.

Out of scope: new tests (sequenced after this change), the
`.editorconfig`/`biome.json` contradiction, `release.yml` digest pinning, and
branch protection, which is a repository setting rather than a file.

## Follow-up: shoring up the suite

Sequenced deliberately after CI, so that every test written below lands already
guarded by the gate.

Recorded here rather than in `bd` because beads writes are blocked: the
database has 13 pending schema migrations (v53 to v66) against a remote-backed
store, and bd is explicit that migrating is a single-designated-machine
coordination decision rather than something an agent should resolve. These
should become issues once that is reconciled.

Ranked:

1. **A plugin directory that never reached `marketplace.json` is invisible.**
   There are 12 directories under `plugins/` and 11 published entries;
   `example-plugin` is unpublished deliberately. The existing suite validates
   only listed-implies-exists, never exists-implies-listed. Adding a plugin and
   forgetting the manifest is silent today. This is the same failure class the
   version test already guards, in the opposite direction.
2. **`plugin.json` validity**: required fields present, `name` matching the
   directory that contains it.
3. **`SKILL.md` frontmatter**: present and parseable, `name` matching its
   directory, `description` non-empty.
4. **Hook scripts resolve**: every script referenced from a `hooks.json` exists
   on disk.
5. **Relative markdown links resolve** between skills and their `references/`.

## Verification

A workflow cannot be fully exercised before it runs on GitHub. What can be
checked locally, and must be, before opening the pull request:

- `bun run lint` exits 0, including the new `lint:shell`.
- `bun test` exits 0 with no reduction in the 241-test count.
- Each command the workflow runs is run locally first, with the same arguments.
- `bunx commitlint` accepts the intended pull request title.

The workflow's own first real run is the pull request that introduces it.
