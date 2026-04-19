---
name: create-skill
description: |
    Expert knowledge for creating well-structured Claude Code skills. Use when
    scaffolding new skills, fixing skill issues, or advising on skill design
    patterns like progressive disclosure, dynamic context injection, and
    subagent delegation.
user-invocable: false
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Claude Code Skill Creation Guide

## Skill Structure

Every skill is a directory with `SKILL.md` as the entrypoint:

```text
my-skill/
  SKILL.md           # Main instructions (required)
  references/        # Detailed guides loaded on demand
  scripts/           # Scripts Claude can execute
  assets/            # Templates, examples
```

### Where Skills Live

| Location | Path | Scope |
| --- | --- | --- |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin is enabled |

Higher-priority locations win when names conflict: enterprise > personal > project.
Plugin skills use `plugin-name:skill-name` namespace and cannot conflict.

## Frontmatter Reference

All fields are optional. Only `description` is recommended.

| Field | Purpose |
| --- | --- |
| `name` | Display name. Defaults to directory name. Kebab-case, max 64 chars. |
| `description` | What the skill does and when to use it. Claude uses this to decide relevance. Max 1,536 chars. |
| `when_to_use` | Additional trigger context. Appended to description. |
| `argument-hint` | Hint shown in autocomplete, e.g. `[issue-number]`. |
| `disable-model-invocation` | `true` = user-only, hidden from Claude's auto-loading. |
| `user-invocable` | `false` = hidden from `/` menu, Claude-only. |
| `allowed-tools` | Tools permitted without asking. Space-separated or YAML list. |
| `model` | Override model when skill is active. |
| `effort` | Effort level: `low`, `medium`, `high`, `xhigh`, `max`. |
| `context` | `fork` = run in isolated subagent. |
| `agent` | Subagent type for `context: fork`: `Explore`, `Plan`, `general-purpose`, or custom. |
| `paths` | Glob patterns limiting activation (e.g., `["src/**/*.ts"]`). |
| `shell` | Shell for inline commands: `bash` (default) or `powershell`. |

### Invocation Control

| Frontmatter | User can invoke | Claude can invoke |
| --- | --- | --- |
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

## String Substitutions

| Variable | Description |
| --- | --- |
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` or `$N` | Specific argument (0-based) |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing this SKILL.md |

## Key Patterns

For detailed guidance on each pattern, read the corresponding reference file.

### Progressive Disclosure

Keep SKILL.md under 500 lines. Move detailed content to `references/`:

```markdown
For advanced configuration, read `references/advanced-config.md`.
```

Reference: `references/progressive-disclosure.md`

### Dynamic Context Injection

Use `` !`command` `` to inject shell output before the skill loads:

```yaml
---
name: pr-review
description: Review current PR
context: fork
agent: Explore
---

## Context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`

Review this PR for issues.
```

Reference: `references/dynamic-context.md`

### Subagent Delegation

Use `context: fork` to run skills in isolation:

```yaml
---
name: deep-research
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly using Glob and Grep.
Summarize findings with file references.
```

Reference: `references/subagent-patterns.md`

### Tool Pre-Approval

Lock down tools for safety-critical skills:

```yaml
---
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

## Writing Good Skills

1. **Lead with the description** — Claude reads it to decide relevance. Front-load key use cases.
2. **Be actionable** — numbered steps, not prose. Claude follows instructions literally.
3. **Use tables** — for reference data, options, field definitions.
4. **Include examples** — show expected input/output so Claude calibrates.
5. **Scope tightly** — one skill per concern. Compose skills rather than building monoliths.
6. **Test the trigger** — ask "What skills are available?" to verify Claude sees it.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Description too vague | Add specific trigger phrases and use cases |
| SKILL.md too long (>500 lines) | Move reference content to `references/` |
| Skill triggers on unrelated prompts | Narrow description, add `paths` filter |
| Skill never triggers | Check description keywords, ensure `disable-model-invocation` isn't set |
| Tool denied during execution | Add tool to `allowed-tools` frontmatter |
