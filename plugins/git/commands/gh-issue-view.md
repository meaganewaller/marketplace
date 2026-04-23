---
description: View details of a GitHub issue
arguments:
  - name: number
    description: Issue number to view
    required: true
---

# View GitHub Issue

View details of a specific issue using `gh issue view`.

## Instructions

1. Run `gh issue view` with the provided issue number
2. Display the issue title, body, state, labels, and comments
3. If the issue doesn't exist, inform the user

## Command

```bash
gh issue view {{number}}
```

## Additional Options

- View in web browser: `gh issue view {{number}} --web`
- View comments: `gh issue view {{number}} --comments`
