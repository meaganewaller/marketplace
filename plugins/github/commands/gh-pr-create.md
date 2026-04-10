---
description: Create a new pull request from the current branch
arguments:
  - name: title
    description: PR title
    required: false
  - name: body
    description: PR body/description
    required: false
  - name: base
    description: Base branch (defaults to main/master)
    required: false
---

# Create GitHub Pull Request

Create a new pull request from the current branch using `gh pr create`.

## Instructions

1. Check if the current branch has been pushed to the remote
2. If not pushed, push the branch first with `git push -u origin HEAD`
3. Analyze the commits on the branch to suggest a title and description
4. Create the PR with `gh pr create`
5. Return the URL of the created PR

## Command

```bash
gh pr create --title "{{title}}" --body "{{body}}" {{#if base}}--base {{base}}{{/if}}
```

## PR Body Format

Use this format for the PR body:

```markdown
## Summary
- Brief description of changes

## Test plan
- [ ] How to test these changes

Generated with Claude Code
```
