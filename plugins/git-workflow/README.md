# git-workflow

Git and GitHub workflow skills — commit, pull request, issue, and PR splitting.

This is a deliberately small plugin: four skills that cover the everyday loop, plus a set of shared rule documents the skills cross-reference instead of restating. The rules are the point — conventional-commit grammar, mood emoji, and issue-linking semantics are defined once and pulled in by whichever skill needs them, so `/commit` and `/pr` can't drift apart.

## Installation

```bash
/plugin install git-workflow@meaganewaller-marketplace
```

## Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated — every skill here shells out to it
- `claude-extract` on `PATH` — only needed for the `/pr` conversation-log step
- `jq` — only needed to read a [gist blocklist](#gist-blocklist) configured through `userConfig`; not required if you set the environment variable directly or configure no blocklist at all

Scripts target bash 3.2 so they run under the system `/bin/bash` on macOS.

## Skills

### `/commit`

Creates a commit. The safety gate is intentional file selection, not a runtime approval prompt — `git add` and `git commit` are pre-approved in `allowed-tools` precisely so the review happens over the diff rather than over a permission dialog.

Enforces three things the other skills also depend on:

- **Conventional commits** — `<type>(<scope>): <subject>`, per [`rules/conventional-commits.md`](rules/conventional-commits.md)
- **Mood emoji** — every subject ends with an emoji reflecting *this change's* vibe, not its type label ([`rules/mood-emoji.md`](rules/mood-emoji.md))
- **American English** — an explicit verification pass before the commit is written

Supports `--amend`. Optionally scans open issues to suggest a `Fixes #N` footer, but won't invent a reference that isn't there.

### `/pr`

Gathers context, drafts the body, then opens the PR **in the browser** for final human review — it never submits one directly. That's structural: `gh-pr-create-web` is a shim that injects `--web` into every `gh pr create` call.

The flow reads any `.github/pull_request_template.md`, collects branch/commit/diff/CI state through `pr-context` in a single call, publishes the session transcript as a secret Gist (see [Gist blocklist](#gist-blocklist)), and drafts a Why / What / Notes-for-reviewers body. Titles follow conventional commits so release-please and squash-merge behave — see [`skills/pr/reference/pr-title.md`](skills/pr/reference/pr-title.md).

Runs on Sonnet.

### `/issue`

Files a well-structured GitHub issue. Searches for duplicates first, picks bug/feature/task (preferring the repo's native issue types over bracket-prefix titles when they're configured), drafts a body with acceptance criteria, and applies labels in the create call rather than as a follow-up edit.

Sub-issue and blocked-by links go through `gh api`, which is intentionally *not* in `allowed-tools` — those mutate another issue's structure, so the skill confirms with you before running them.

### `/split-pr`

Read-only. Analyzes the current diff, groups it by logical concern, and proposes a split with a suggested creation order. It never stages, commits, or pushes — it hands you a plan and stops.

Resolves the base branch from upstream tracking, then `origin/HEAD`, and asks rather than assuming `main` if neither resolves.

## Rules

Shared reference documents. Skills link to these rather than duplicating them.

| File | Used by |
|------|---------|
| [`conventional-commits.md`](rules/conventional-commits.md) | `/commit`, `/pr` — canonical type table and subject grammar |
| [`mood-emoji.md`](rules/mood-emoji.md) | `/commit`, `/pr` — the emoji palette, and why it isn't derived from the type |
| [`issue-linking.md`](rules/issue-linking.md) | `/commit`, `/pr`, `/issue` — closing keywords vs. native dependency/sub-issue APIs |
| [`issue-detection.md`](rules/issue-detection.md) | `/commit`, `/pr` — heuristics for matching a diff to an open issue |
| [`github-labels.md`](rules/github-labels.md) | `/issue`, optionally `/pr` — discovering and applying a repo's labels |
| [`branch-naming.md`](rules/branch-naming.md) | *Nothing yet* — no skill here creates branches. Kept for a future branch-creation skill and for ad-hoc "what should I name this?" questions. |

Two rules are worth calling out because they're easy to get wrong:

- **The emoji is not a function of the type.** `feat` is not always `:sparkles:`. If you can derive it mechanically, it's the wrong emoji.
- **`Blocks #123` as plain text does nothing.** GitHub stopped parsing it. Use the native `dependencies/blocked_by` and `sub_issues` APIs so relationships actually appear on project boards.

## Executables

These live in `bin/`, so Claude Code adds them to the Bash tool's `PATH` while the plugin is enabled — the skills call them as bare commands rather than by path.

| Command | Purpose |
|--------|---------|
| `pr-context` | Collects branch info, commit range, diff stats, CI status, and referenced issues in one execution, replacing 5–7 tool calls. Always compares against `origin/<base>`, never local. |
| `gh-pr-create-web` | Shim that injects `--web` into `gh pr create` so PRs always open in the browser first. |
| `claude-session-gist` | Publishes the current session as a secret Gist, refusing outright for blocklisted repos. |
| `claude-extract-session` | Extracts a session by ID to markdown on stdout. Used by `claude-session-gist`. |

### Gist blocklist

`/pr` attaches a link to the session transcript in the PR footer. For work repositories whose conversation logs must never leave the machine, `claude-session-gist` checks the repo's git remotes **before extracting or uploading anything**.

Patterns are whitespace-separated globs matched against a normalized, lowercased `host/org/repo` form, so HTTPS and SSH remotes for the same repo compare equal. **Nothing is blocked until you set a value.**

The plugin declares this as a [`userConfig`](.claude-plugin/plugin.json) option, so Claude Code prompts for it when you enable the plugin — no hand-editing required. Answer the **Gist blocklist** prompt with something like:

```text
github.com/acme/* github.enterprise.internal/*
```

The value persists to `pluginConfigs["git-workflow@…"].options.gist_blocklist` in your user settings.

To override it for one shell, a test, or CI, set the environment variable instead — it takes precedence over the configured value:

```bash
export MW_MARKETPLACE_CLAUDE_SESSION_GIST_BLOCKLIST='github.com/acme/* github.enterprise.internal/*'
```

<details>
<summary>How the value reaches the script</summary>

`userConfig` values are exported as `CLAUDE_PLUGIN_OPTION_<KEY>` only to **hook** processes, and `/pr` invokes this shim through the Bash tool rather than a hook — so that export is absent on the normal path. The [plugins reference](https://code.claude.com/docs/en/plugins-reference) directs shell-invoked components to read the value from a config file instead, which is what the shim does. It resolves in this order:

1. `MW_MARKETPLACE_CLAUDE_SESSION_GIST_BLOCKLIST` — explicit override; the only source that works in a bare shell or CI
2. `CLAUDE_PLUGIN_OPTION_GIST_BLOCKLIST` — present when a hook runs it
3. `pluginConfigs[…].options.gist_blocklist` in `$CLAUDE_CONFIG_DIR/settings.json` (falling back to `~/.claude`) — where `userConfig` actually persists

Step 3 needs `jq`. If the settings file has a blocklist configured and `jq` is missing, the shim **refuses** rather than parsing JSON with a regex and returning a confidently wrong answer.

</details>

Confirm the blocklist is live before trusting it. From inside a repo you expect to be blocked:

```bash
claude-session-gist test-id; echo "exit=$?"
```

Exit `3` with no stdout means the blocklist matched. Any other exit means it did not.

The design is fail-closed by intent: a remote that can't be normalized is treated as blocked. A false block costs one missing PR link; a false pass leaks a work conversation log.

Exit codes matter to the calling skill, and `/pr` distinguishes them:

| Exit | Meaning | `/pr` behavior |
|------|---------|----------------|
| `0` | Gist created, URL on stdout | Adds the link to the PR footer |
| `3` | Repo is blocklisted, nothing extracted | Expected — omits the footer, notes why |
| `1` | Genuine failure (`gh` unauthenticated, network, extraction broke) | Surfaces stderr and asks how to proceed |

Never work around a `3` — it's a hard guarantee enforced by the shim, not a suggestion.

## Design notes

**Why `git -C` is banned.** Every skill forbids it. The flag rewrites the command into a form that no longer matches the `allowed-tools` patterns, which forces an approval prompt for what should be a pre-approved read. Plain `git status` already operates on the repo you're in.

**Why `/pr` can't submit.** Opening in the browser is not a preference that a prompt can override — it's a shim. The model has no path to a direct `gh pr create`.

**Why the rules are separate files.** `/commit` and `/pr` both need conventional-commit grammar, mood emoji, and issue linking. Inlining them into both skills means they drift. The skill files carry what's specific to them; the shared semantics live in `rules/`.
