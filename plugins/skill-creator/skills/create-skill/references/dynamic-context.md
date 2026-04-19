# Dynamic Context Injection

The `` !`command` `` syntax runs shell commands **before** skill content is sent to Claude.
The command's stdout replaces the placeholder inline.

## Single-Line Commands

```markdown
Current branch: !`git branch --show-current`
Last commit: !`git log --oneline -1`
```

## Multi-Line Commands

Use a fenced code block opened with ` ```! `:

````markdown
```!
git diff --stat HEAD~5..HEAD
```
````

## Common Patterns

### PR Review Context

````yaml
---
name: pr-review
context: fork
agent: Explore
---

## PR Context
- Title: !`gh pr view --json title -q .title`
- Author: !`gh pr view --json author -q .author.login`
- Changed files: !`gh pr diff --name-only`

## Diff
```!
gh pr diff
```

Review this PR for correctness, style, and potential issues.
````

### Git-Aware Skills

```markdown
## Repository State
- Branch: !`git branch --show-current`
- Uncommitted changes: !`git status --short`
- Recent commits: !`git log --oneline -5`
```

### Environment-Aware Skills

```markdown
## Environment
- Node version: !`node --version 2>/dev/null || echo "not installed"`
- Bun version: !`bun --version 2>/dev/null || echo "not installed"`
```

## Important Notes

- Commands run in the project's working directory
- If a command fails, the error output is injected (which Claude can handle)
- Commands run **once** when the skill is invoked, not on every message
- Keep commands fast — slow commands delay skill loading
