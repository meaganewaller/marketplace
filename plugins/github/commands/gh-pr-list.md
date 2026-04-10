---
description: List pull requests in the current GitHub repository
arguments:
  - name: state
    description: Filter by state (open, closed, merged, all)
    required: false
  - name: author
    description: Filter by author
    required: false
---

# List GitHub Pull Requests

List pull requests in the current repository using `gh pr list`.

## Instructions

1. Run `gh pr list` with any provided filters
2. Display the results showing PR number, title, branch, and status
3. If no PRs found, inform the user

## Command

```bash
gh pr list {{#if state}}--state {{state}}{{/if}} {{#if author}}--author {{author}}{{/if}}
```

## Examples

- List all open PRs: `gh pr list`
- List merged PRs: `gh pr list --state merged`
- List your PRs: `gh pr list --author @me`
