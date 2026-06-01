---
name: command-development
description: >-
  This skill should be used when the user asks to "create a slash command", "add
  a command", "write a custom command", "define command arguments", "use command
  frontmatter", or needs guidance on slash command structure, dynamic arguments,
  or command development best practices for Claude Code plugins.
---

# Command Development

Guidance for creating Claude Code plugin slash commands.

## What Commands Are

Slash commands are Markdown files containing instructions Claude executes when
invoked. Plugin commands live in `commands/` and appear as
`/plugin-name:command-name` when the plugin is installed.

## Critical Rule: Write for Claude

Command content is instructions **to Claude**, not messages to the user.

**Correct:**

```markdown
Review the target path for security issues including SQL injection and XSS.
Report findings with file:line references and severity ratings.
```

**Incorrect:**

```markdown
This command will review your code for security issues.
You will receive a report with vulnerability details.
```

## File Format

```text
commands/
├── validate-plugin.md    # /meta:validate-plugin
└── audit-skill.md        # /meta:audit-skill
```

Use kebab-case filenames. The filename (without `.md`) becomes the command name.

## Frontmatter

Optional YAML frontmatter configures behavior:

```yaml
---
description: Short summary shown in /help
argument-hint: <path>
allowed-tools: Read, Grep, Glob, Bash
---
```

Common fields:

| Field | Purpose |
| --- | --- |
| `description` | Help text for `/help` |
| `argument-hint` | Hint for expected arguments |
| `allowed-tools` | Restrict tools for the command session |
| `arguments` | Named arguments with descriptions |

## Dynamic Context

Commands can inject runtime values:

- `$ARGUMENTS` — raw argument string from invocation
- `$1`, `$2` — positional arguments (when using `arguments` frontmatter)
- `@path/to/file` — include file contents in command context
- `` !`command` `` — run bash and inject output (use sparingly)

## Authoring Workflow

1. Define the outcome Claude should produce
2. Write step-by-step instructions in imperative form
3. Add frontmatter for description and argument hints
4. Reference a skill when the command delegates to shared guidance
5. Specify output format when reports or structured results are expected
6. Update the plugin README Components section

## Command + Skill Pattern

For complex workflows, keep the command thin and activate a skill:

```markdown
When invoked:

1. Use $ARGUMENTS as the target path
2. Apply the plugin-structure skill validation workflow
3. Produce a severity-ranked findings report
```

## Additional Resources

- **`references/patterns.md`** — Reusable command patterns and examples
