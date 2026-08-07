---
name: pr
description: Creates a pull request and opens it in the browser for final human review before submission. Use when the user asks to open a PR, create a pull request, or ship the current branch for review.
argument-hint: "[additional context]"
model: sonnet
allowed-tools:
    - Glob
    - Read
    - Bash(git status:*)
    - Bash(git log:*)
    - Bash(git diff:*)
    - Bash(git fetch:*)
    - Bash(git push:*)
    - Bash(gh issue view:*)
    - Bash(bash "${CLAUDE_PLUGIN_ROOT}/scripts/claude-session-gist":*)
    - Bash(bash "${CLAUDE_PLUGIN_ROOT}/scripts/gh-pr-create-web":*)
    - Bash(bash "${CLAUDE_PLUGIN_ROOT}/scripts/pr-context":*)
---

# Create Pull Request

Opens a pull request in the browser for final review and submission.

## Arguments

```text
$ARGUMENTS
```

Optional context to incorporate into the PR description - details not covered in commits, important considerations, areas needing attention, or anything to emphasize for reviewers.

## Instructions

### 1. Check for PR Template

Search for templates in order of precedence:

```text
.github/pull_request_template.md
.github/PULL_REQUEST_TEMPLATE/*.md
pull_request_template.md
PULL_REQUEST_TEMPLATE/*.md
docs/pull_request_template.md
docs/PULL_REQUEST_TEMPLATE/*.md
```

If multiple templates exist in a `PULL_REQUEST_TEMPLATE/` directory, list them and ask which to use.

If a template is found, use its section structure in step 4 instead of the default Why/What/Notes layout — fill in its existing headings rather than replacing them.

### 2. Gather Context

Run `git status` first to check for uncommitted changes.

Then gather the rest with the context script rather than ad hoc `git log`/`git diff` calls — it fetches `origin/<base>` before comparing, which matters: comparing against **local** `main` instead of `origin/main` can silently pull in commits from a previous PR that hasn't merged yet, making this PR's diff wrong.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/pr-context" [base-branch]
```

Defaults to `main` as the base if not given. It reports: branch and remote-tracking status, the commit range and types since `origin/<base>`, diff stats and changed files, issue references and closing keywords already in the commits, a PR title suggestion, and any existing PR + its CI status. Use this output for the rest of the steps below instead of re-deriving it.

If there are staged changes ready to commit, ask whether to commit first or proceed.

If there are only untracked files (not relevant to the PR), proceed without asking.

If the script reports `FETCH_FAILED=true` or can't resolve `origin/<base>`, ask the user for the correct base branch before continuing.

### 3. Export Conversation Log and Create Gist

Publish the current session through the gist shim, which extracts **only the current session** and pipes it to a secret Gist:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/claude-session-gist" "${CLAUDE_SESSION_ID}"
```

The shim:

- Takes the current session ID (provided by the `${CLAUDE_SESSION_ID}` substitution)
- **Checks the current repo's git remote against the gist blocklist first** (work repos whose conversation logs must never leave the machine — whitespace-separated globs from the plugin's `gist_blocklist` user config, overridable via `MW_MARKETPLACE_CLAUDE_SESSION_GIST_BLOCKLIST`, matched against a normalized lowercase `host/org/repo` so HTTPS and SSH remotes compare equal)
- For a **blocklisted** repo: refuses before extracting or uploading anything — prints an explanation to stderr, exits `3`, and writes **nothing to stdout**
- Otherwise: extracts with `--detailed` output, pipes directly to `gh gist create` (secret by default), and prints **only the Gist URL** to stdout

**Handle the result — check the exit code, don't just check for a missing URL:**

- **Exit `0` with a URL on stdout** → keep the URL for the PR footer in step 4.
- **Exit `3` (no stdout)** → the repo is blocklisted. This is expected, not an error. Omit the conversation-log footer from the PR body and note in the final report that it was skipped because the repository is on the gist blocklist.
- **Any other non-zero exit (no stdout)** → this is a genuine failure (`gh` not authenticated, network error, `claude-extract` broke, etc.), *not* a blocklist skip. Surface the stderr output to the user and ask whether to proceed without the conversation log or stop to fix the underlying issue. Do not silently report it as "blocklisted" — that misattributes the cause.

This blocklist behavior is a hard guarantee enforced by the shim, not just a guideline — never work around it, and never retry extraction another way for a blocklisted repo.

### 4. Draft PR Content

**Title:** Derive from branch name or commits. If the repo follows conventional commits (check recent merged PR titles or `git log --oneline`), the title must use it — see [conventional-commits.md](../../rules/conventional-commits.md) for the type table and subject grammar, and [pr-title.md](reference/pr-title.md) for scope discovery, the exact length budget, and why it matters for release-please and squash-merge. End with a mood emoji that reflects the vibe of the conversation or task — not derived mechanically from the change type. Quick picks:

| Emoji | Shortcode | Mood |
|-------|-----------|------|
| :sparkles: | `:sparkles:` | excited about something new |
| :bug: | `:bug:` | squashing something annoying |
| :relieved: | `:relieved:` | finally fixed, weight off shoulders |
| :rocket: | `:rocket:` | shipping, deploying, launching |
| :thinking: | `:thinking:` | exploratory, not sure yet |

For the full palette and guidance on picking a non-obvious emoji, see [mood-emoji.md](../../rules/mood-emoji.md) (shared with the `commit` skill).

**Body:** If a template was found in step 1, fill in its sections. Otherwise use:

```markdown
## Why
[Problem/motivation - 1-3 sentences]

## What
[Approach - brief, not a code walkthrough]

## Notes for reviewers
[Non-obvious decisions, areas of uncertainty, or "looks wrong but isn't" explanations]

Closes #N

---
🤖 [Conversation log](GIST_URL)
```

**Issue references:** the context script's `REFERENCED_ISSUES` and `CLOSING_KEYWORDS` output already captures anything referenced in the commits — reuse those rather than re-deriving. If commits reference an issue without a closing keyword, or no issue was referenced at all but the diff looks like it addresses one, see [issue-detection.md](../../rules/issue-detection.md) to find candidates and [issue-linking.md](../../rules/issue-linking.md) for which keyword to use. Omit the `Closes #N` line entirely if there's no issue to reference — don't leave a placeholder.

The trailing horizontal rule and `🤖 [Conversation log]` line are **conditional** — include them only if step 3 produced a URL. Omit both entirely for blocklisted repos or failed gist creation.

If the user provided additional context in arguments, incorporate it appropriately into the PR body.

Draft the content but don't show it to the user for approval in chat — `gh pr create --web` opens a pre-filled compose page in the browser, and that page *is* the review/approval step, so a second confirmation in chat would be redundant.

### 5. Push and Create PR

**Push first:** If the branch hasn't been pushed or is behind:

```bash
git push -u origin <branch-name>
```

**Then create PR using the shim:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/gh-pr-create-web" --title "..." --body "..."
```

The shim automatically adds `--web`, ensuring PRs open in browser for human review. Do NOT add `--web` yourself—the shim handles it.

### 6. Handle Push/Creation Failures

- **`git push` rejected (diverged, no permissions, branch protection)** — read the error, don't force-push without asking. Tell the user what happened and ask how to proceed (rebase, pull, or manual resolution). If a force-push is genuinely warranted (e.g. after a rebase the user requested), use `--force-with-lease`, never bare `--force` — it fails safely if the remote has commits you haven't seen, instead of silently overwriting someone else's work.
- **`gh-pr-create-web` fails (PR already exists for branch, `gh` not authenticated, base branch missing)** — surface the actual error to the user rather than retrying blindly. If a PR already exists, ask whether they want to update the existing one instead.

Only proceed to step 7 once the push and PR creation both actually succeed.

### 7. Report Result

Note that the PR was created and the browser opened for final review. If the conversation-log footer was omitted (blocklisted repo or gist failure), say so and why.

## Examples

```text
/pr                                           → Standard PR, opens browser
/pr This needs careful review of the DB migrations → Emphasizes DB migration review
/pr The API changes are breaking but documented    → Highlights breaking changes
```

## Edge Cases

- **No upstream:** Ask for base branch (handled in step 2)
- **Empty diff:** Warn and confirm before creating empty PR
- **Draft PR:** If user mentions "draft" or "WIP", add `--draft` flag
- **Multiple templates:** List options, ask which to use
