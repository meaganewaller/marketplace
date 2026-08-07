# Detecting Issues Related to a Diff

Referenced by [commit](../skills/commit/SKILL.md) (optional pre-commit scan) and [pr](../skills/pr/SKILL.md) (populating the Issue References section of the PR body). Once a candidate issue is found, use [issue-linking.md](issue-linking.md) to pick the right keyword.

This is a heuristic match, not a certainty — report confidence, don't silently commit to a guess.

## Workflow

### 1. Fetch open issues

```bash
# Get open issues with relevant metadata
gh issue list --state open --json number,title,body,labels --limit 50

# Or filter by label for a targeted pass
gh issue list --state open --label bug --json number,title,body
gh issue list --state open --label enhancement --json number,title,body
```

### 2. Analyze the changes

```bash
# Staged changes (before commit)
git diff --cached --name-only
git diff --cached

# Committed range (before PR)
git diff origin/main...HEAD --name-only
git diff origin/main...HEAD
```

### 3. Score candidate matches

| Signal | Weight | Example |
|--------|--------|---------|
| File path in issue body | High | Issue mentions `src/auth/login.ts`, diff includes that file |
| Error message match | High | Issue title contains error text found in diff |
| Component/scope match | Medium | Issue labeled `auth`, changes are in `src/auth/` |
| Keyword overlap | Medium | Issue mentions "login", diff modifies login logic |
| Function name match | Medium | Issue references `validateToken()`, diff modifies it |

```text
For each changed file:
  1. Extract file path components (directory, filename, extension)
  2. Extract modified function/class names from the diff
  3. Extract error messages or string literals from the diff

For each open issue:
  1. Parse title for keywords, file references, error messages
  2. Parse body for code snippets, file paths, stack traces
  3. Check labels for component/area tags

Score each (file, issue) pair:
  +3 exact file path match
  +2 error message or function name match
  +1 directory/component match
  +1 keyword overlap (>2 significant words)

Report issues with score >= 2 as potential matches
```

## Examples

**Bug fix:** issue "Login fails with 'invalid token' error", staged changes in `src/auth/token.ts`. Signals: file path matches "Login" context, error message likely in diff, issue labeled `bug`. → `Fixes #123`

**Feature:** issue "Add dark mode support", staged changes in `src/theme/dark-mode.ts`, `src/components/ThemeToggle.tsx`. Signals: new files with relevant names, issue labeled `enhancement`, keyword overlap ("dark mode", "theme"). → `Closes #456`

**Partial work:** issue "Refactor authentication system", staged changes in `src/auth/oauth.ts` only (more work needed). Signals: file path matches scope, issue body lists multiple sub-tasks, other files mentioned in the issue haven't changed yet. → `Refs #789`

## Commands

```bash
# Quick scan: relevant open issues for staged changes
gh issue list --state open --json number,title,labels --limit 20 | \
  jq -r '.[] | "#\(.number): \(.title)"'

# Full detail for a specific issue
gh issue view <number> --json title,body,labels,assignees

# Search by keyword
gh issue list --search "keyword in:title,body" --state open

# Search for issues mentioning a specific file or directory
gh issue list --search "filename.ts in:body" --state open
gh issue list --search "src/auth in:body" --state open
```

## Reporting matches

```text
Detected potentially related issues:

HIGH CONFIDENCE:
- #123 "Login fails with invalid token" → Fixes #123
  Match: File path src/auth/token.ts, error message match

MEDIUM CONFIDENCE:
- #456 "Improve auth error handling" → Refs #456
  Match: Directory src/auth/, keyword "error"

Suggested footer:
Fixes #123
Refs #456
```

## Guidance

- Prefer `Fixes` over `Closes` for bug fixes — clearer intent.
- Use `Refs` for partial work, to keep traceability without premature closure.
- Include multiple references when a commit or PR addresses several issues.
- Verify issue state — don't reference an already-closed issue unless reopening.
- Check whether the issue already has a linked PR in progress.

## Edge cases

**No matching issues found:** for trivial fixes, committing without an issue reference is fine. For significant changes, consider whether an issue should exist for traceability — create one retroactively and link it in the PR if so.

**Multiple matching issues:** either close all that are fully resolved (`Fixes #123, fixes #124, fixes #125`) or mix closing and reference keywords per issue — see [issue-linking.md](issue-linking.md).
