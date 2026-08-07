---
name: commit
description: Use when committing code changes. Enforces intentional file selection, conventional commits, and why-focused messages.
argument-hint: "[message | --amend | files...]"
allowed-tools:
    - Bash(git status:*)
    - Bash(git diff:*)
    - Bash(git log:*)
    - Bash(git show:*)
    - Bash(git add:*)
    - Bash(git commit:*)
    - Bash(gh issue list:*)
    - Bash(gh issue view:*)
---

# Git Commit

## Arguments

```text
$ARGUMENTS
```

## Constraints

**Never use `git -C <path>`** — always run git commands from the current working directory. The `-C` flag rewrites the command in a way that doesn't match `allowed-tools` patterns, forcing unnecessary user approval. Plain `git status`, `git log`, etc. already operate on the repo you're in.

`git add` and `git commit` are pre-approved so you can complete a commit without a prompt at the mutating step — the safety gate for this skill is the intentional file-selection process in step 2, not a runtime approval.

## Instructions

### 1. Assess Current State

Run in parallel:

- `git status` — see staged/unstaged/untracked files
- `git diff --cached` — see what's staged
- `git diff` — see unstaged changes
- `git log --oneline -5` — recent commit style reference

If `git status` shows a clean tree with nothing staged or unstaged, stop and tell the user there's nothing to commit — don't invent a commit.

### 2. File Selection (CRITICAL)

**Never use `git add -A` or `git add .`** — be intentional about every file.

Decision tree:

- **Arguments include specific files** → stage those files
- **Files already staged** → verify they're the intended changes
- **Nothing staged** → infer from conversation context which files to stage

Use `git diff --name-only` to review changed files. Include only:

- Files modified during this conversation
- Files directly relevant to the logical change

Exclude:

- Unrelated changes (stage separately — see below)
- Generated files (unless intentional)
- Sensitive files (.env, credentials)

**If the diff spans unrelated concerns** (e.g., a bug fix mixed with an unrelated refactor or a dependency bump), stop before committing. Propose splitting into separate commits, stage the first logical group, and ask the user to confirm before proceeding to the next.

### 3. Craft Commit Message

**Format:** Conventional Commits

```text
<type>(<scope>): <subject>

[optional body explaining WHY]
```

**Type and subject grammar:** see [conventional-commits.md](../../rules/conventional-commits.md) for the full type table and decision tree (shared with the `pr` skill's title step) — imperative mood, lowercase after the colon, no trailing period.

**Commit-specific rules on top of that:**

- Subject line ≤72 characters including mood emoji (keeps `git log --oneline` and GitHub's PR/commit list view from truncating the line — a tighter budget than a PR title's 50, since PR titles don't carry an emoji)
- Focus on WHY, not WHAT (the diff shows what)
- Body lines ≤80 characters (standard terminal-width wrap so the body reads cleanly in `git log` without a pager reflowing it)

**Message source:**

- **Arguments provide message** → use it (adjust format if needed)
- **No message** → draft based on staged changes, explain reasoning

**Issue references (optional):** if the diff looks like it addresses an open issue, check [issue-detection.md](../../rules/issue-detection.md) for the matching heuristics and [issue-linking.md](../../rules/issue-linking.md) for which keyword (`Fixes`, `Refs`, etc.) to add to the body. Don't force a reference that isn't there — this is a nice-to-have, not a required step.

**Mood emoji:** End every subject line with a GitHub emoji that reflects the *content and vibe of this specific change*, not the conventional-commit type (`feat` is not always `:sparkles:`, `fix` is not always `:bug:`). Quick picks:

| Emoji | Shortcode | Mood |
|-------|-----------|------|
| :sparkles: | `:sparkles:` | excited about something new |
| :bug: | `:bug:` | squashing something annoying |
| :relieved: | `:relieved:` | finally fixed, weight off shoulders |
| :broom: | `:broom:` | tidying up, chores |
| :rocket: | `:rocket:` | shipping, deploying, launching |

For the full palette and guidance on picking a non-obvious emoji, see [mood-emoji.md](../../rules/mood-emoji.md).

### 4. Verify Language (American English)

Before running `git commit`, scan the subject + body and convert any British spellings to American English. Applies to commit messages and any PR/issue copy drafted alongside them — not to code identifiers or third-party names that legitimately ship British spellings (e.g. `Element.cloneNode`).

<!-- The British column below is intentional -- these are the spellings to avoid, not to adopt.
     Scoped to this file so cspell still flags them everywhere else.
     cspell:ignore behaviour catalyse customise favourite normalise optimise
     cspell:ignore prioritise recognise licence defence offence pretence -->

| British | American |
|---------|----------|
| colour, favourite, behaviour, honour, flavour | color, favorite, behavior, honor, flavor |
| normalise, organise, customise, optimise, recognise, prioritise, summarise | normalize, organize, customize, optimize, recognize, prioritize, summarize |
| cancelled, labelled, signalled, modelled, travelled | canceled, labeled, signaled, modeled, traveled |
| centre, theatre, fibre, metre, litre | center, theater, fiber, meter, liter |
| analyse, paralyse, catalyse | analyze, paralyze, catalyze |
| licence (noun), defence, offence, pretence | license, defense, offense, pretense |
| catalogue, dialogue, analogue | catalog, dialog, analog |
| grey, programme (computing), whilst, amongst | gray, program, while, among |
| judgement, acknowledgement, ageing | judgment, acknowledgment, aging |

### 5. Execute Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line here :emoji:

Optional body explaining why this change was made.
EOF
)"
```

### 6. Handle Commit Failures

If `git commit` doesn't succeed:

- **Pre-commit hook rejects it (lint/format/test failure)** — read the hook's error output, fix the underlying issue (not the hook), re-stage, and retry. Don't bypass with `--no-verify` unless the user explicitly asks for it.
- **"Nothing to commit"** — re-check `git status`; the file selection in step 2 likely didn't stage what you intended.
- **Merge conflict markers present** — stop and tell the user; don't commit unresolved conflicts.

Only proceed to step 7 once `git commit` actually succeeds.

### 7. Verify

Run `git status` to confirm clean state or show remaining changes.

## Amend Mode

If arguments include `--amend`:

1. Show current HEAD commit with `git show --stat HEAD`
2. Stage additional changes if specified
3. Run `git commit --amend`

**Warning:** Only amend unpushed commits.

## Examples

```text
/commit                           → assess changes, draft message, commit
/commit fix login redirect        → stage relevant files, commit with message
/commit --amend                   → amend previous commit
/commit src/auth.ts src/login.ts  → stage specific files, draft message, commit
```

Example commit messages with mood:

```text
feat(auth): add OAuth2 login flow :sparkles:
fix(auth): resolve login redirect loop :relieved:
chore(deps): bump mise tool versions :broom:
refactor(cli): remove dead argument parser :coffin:
```
