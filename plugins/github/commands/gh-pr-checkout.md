---
description: Checkout a pull request locally
arguments:
  - name: number
    description: PR number to checkout
    required: true
---

# Checkout GitHub Pull Request

Checkout a pull request locally using `gh pr checkout`.

## Instructions

1. Run `gh pr checkout` with the provided PR number
2. This will create a local branch tracking the PR
3. Inform the user of the branch name they're now on

## Command

```bash
gh pr checkout {{number}}
```

## Notes

- This creates a local branch with the PR's head branch name
- You can make changes and push to update the PR
- Use `git switch -` to return to your previous branch
