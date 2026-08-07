# GitHub Labels

Referenced by [issue](../skills/issue/SKILL.md) when creating issues, and optionally by [pr](../skills/pr/SKILL.md) when a repo's conventions call for labeling PRs.

## Discovering available labels

```bash
# List all labels with details
gh label list --json name,description,color --limit 50

# Search for specific labels
gh label list --search "bug"

# Output as simple list
gh label list --json name -q '.[].name'
```

## Adding labels to PRs

```bash
# Single label
gh pr create --label "bug"

# Multiple labels (repeat flag)
gh pr create --label "bug" --label "priority:high"

# Comma-separated
gh pr create --label "bug,priority:high"

# Add to existing PR
gh pr edit 123 --add-label "ready-for-review"
```

## Adding labels to issues

```bash
# Create with labels
gh issue create --label "bug,needs-triage"

# Add to existing issue
gh issue edit 123 --add-label "in-progress"

# Remove label
gh issue edit 123 --remove-label "needs-triage"
```

## Common label categories

| Category | Examples |
|----------|----------|
| Type | `bug`, `feature`, `enhancement`, `documentation`, `chore` |
| Priority | `priority:critical`, `priority:high`, `priority:medium`, `priority:low` |
| Status | `needs-triage`, `in-progress`, `blocked`, `ready-for-review` |
| Area | `frontend`, `backend`, `infrastructure`, `testing`, `ci-cd` |

## Label inheritance pattern

When creating a PR from an issue:

1. Read issue labels via `gh issue view N --json labels`
2. Apply the same labels to the PR: `gh pr create --label "label1,label2"`

This maintains traceability and consistent categorization.

## Commands

| Context | Command |
|---------|---------|
| List all labels (machine-readable) | `gh label list --json name,description,color --limit 50` |
| Get label names only | `gh label list --json name -q '.[].name'` |
| Add label to PR silently | `gh pr edit $PR --add-label "label"` |
| Check current issue labels | `gh issue view $ISSUE --json labels -q '.labels[].name'` |
| Inherit labels from issue to PR | `gh issue view $ISSUE --json labels -q '[.labels[].name] \| join(",")' \| xargs -I{} gh pr edit $PR --add-label {}` |
