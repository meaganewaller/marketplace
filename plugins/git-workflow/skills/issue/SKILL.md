---
name: issue
description: Create well-structured GitHub issues with clear titles, descriptions, and acceptance criteria. Use when filing bugs, requesting features, or structuring issue content.
argument-hint: "[title or description]"
allowed-tools:
    - Read
    - Grep
    - Glob
    - Bash(gh issue list:*)
    - Bash(gh issue view:*)
    - Bash(gh issue create:*)
    - Bash(gh issue edit:*)
    - Bash(gh label list:*)
---

# GitHub Issue

Create well-structured, actionable GitHub issues.

## Constraints

**Search before creating.** Always check for an existing issue before filing a new one — a duplicate is worse than a slightly-late report.

**`gh api` for sub-issue and dependency links is intentionally left out of `allowed-tools`.** Wiring a sub-issue or blocked-by relationship changes another issue's structure, not just this one — confirm with the user before running it (see step 5).

## Instructions

### 1. Search for existing issues

```bash
gh issue list --search "keyword in:title,body" --state all
```

If a close match exists, tell the user and ask whether to comment on it instead of filing a new one.

### 2. Determine the type

Bug, feature, or task. If unclear from the request, ask. If the repo has custom issue types configured, prefer `gh issue create --type "Bug"` over the bracket-prefix title convention below — check with `gh issue create --type ""` (invalid value lists the valid types in the error) or ask the user. Bracket prefixes and native types are redundant; use one, not both.

### 3. Draft the title

```text
[Type] Component: Brief description
```

| Type | Example |
|------|---------|
| Bug | `[Bug] Auth: Login fails with valid credentials` |
| Feature | `[Feature] API: Add rate limiting support` |
| Docs | `[Docs] README: Add installation instructions` |
| Chore | `[Chore] CI: Update Node.js version` |

- Be specific — not "Bug" but "Login fails with OAuth"
- Include the component for triage
- Keep under 72 characters

### 4. Draft the body

**Bug report:**

```markdown
## Summary
Brief description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: macOS 14.0
- Browser: Chrome 120
- Version: 2.1.0
```

**Feature request:**

```markdown
## Summary
What this feature does.

## Motivation
Why this is needed. What problem does it solve?

## Proposed Solution
Description of desired behavior.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

Fill in real specifics — don't leave templated placeholder text in the final body. If the user's request doesn't have enough detail for a section (e.g. no repro steps given), ask rather than inventing them.

### 5. Link related issues (optional)

If this issue is part of a larger piece of work, blocked by something, or a soft follow-up to another issue, see [issue-linking.md](../../rules/issue-linking.md) for which relationship mechanism to use. Sub-issue and blocked-by links go through `gh api` — confirm the parent/blocking issue number with the user before running it, since it's not in `allowed-tools` (see Constraints).

### 6. Apply labels

See [github-labels.md](../../rules/github-labels.md) for discovering a repo's label conventions. Include labels in the create command rather than as a separate edit:

```bash
gh issue create --title "[Bug] Auth: Login fails" --body "..." --label "bug,priority:high"
```

### 7. Create the issue

```bash
# Standard
gh issue create --title "..." --body "..." --label "bug"

# With native issue type
gh issue create --title "..." --body "..." --type "Bug"

# With assignee
gh issue create --title "..." --body "..." --assignee "@me"
```

### 8. Report result

Confirm the issue number and URL. If it was linked to a parent or blocking issue in step 5, confirm that too.

## Quick reference

| Action | Command |
|--------|---------|
| Search first | `gh issue list --search "keyword" --state all` |
| Create | `gh issue create --title "..." --body "..."` |
| Create with type | `gh issue create --title "..." --body "..." --type "Bug"` |
| View | `gh issue view N --json title,body,labels` |
| Edit | `gh issue edit N --title "..."` |
| List labels | `gh label list --json name` |

## Examples

```text
/issue login fails with OAuth                → search first, then draft a bug report
/issue add rate limiting to the API           → draft a feature request
```
