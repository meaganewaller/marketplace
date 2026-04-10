---
description: View details of a GitHub pull request
arguments:
  - name: number
    description: PR number to view
    required: true
---

# View GitHub Pull Request

View details of a specific pull request using `gh pr view`.

## Instructions

1. Run `gh pr view` with the provided PR number
2. Display the PR title, body, state, reviewers, and checks status
3. If the PR doesn't exist, inform the user

## Command

```bash
gh pr view {{number}}
```

## Additional Options

- View in web browser: `gh pr view {{number}} --web`
- View comments: `gh pr view {{number}} --comments`
- View checks: `gh pr checks {{number}}`
