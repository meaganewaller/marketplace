---
description: List issues in the current GitHub repository
arguments:
  - name: state
    description: Filter by state (open, closed, all)
    required: false
  - name: label
    description: Filter by label
    required: false
---

# List GitHub Issues

List issues in the current repository using `gh issue list`.

## Instructions

1. Run `gh issue list` with any provided filters
2. Display the results in a readable format
3. If no issues found, inform the user

## Command

```bash
gh issue list {{#if state}}--state {{state}}{{/if}} {{#if label}}--label "{{label}}"{{/if}}
```

## Examples

- List all open issues: `gh issue list`
- List closed issues: `gh issue list --state closed`
- List issues with label: `gh issue list --label "bug"`
