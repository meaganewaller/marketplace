---
description: Create a new issue in the current GitHub repository
arguments:
  - name: title
    description: Issue title
    required: false
  - name: body
    description: Issue body/description
    required: false
---

# Create GitHub Issue

Create a new issue in the current repository using `gh issue create`.

## Instructions

1. If title and body are provided, create the issue directly
2. If not provided, ask the user for:
   - Issue title (required)
   - Issue description (optional)
   - Labels (optional)
3. Run `gh issue create` with the provided information
4. Return the URL of the created issue

## Command

```bash
gh issue create --title "{{title}}" --body "{{body}}"
```

## Interactive Mode

If no arguments provided, use:

```bash
gh issue create
```

This opens an interactive prompt for the user.
