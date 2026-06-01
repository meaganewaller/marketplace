# Command Patterns

## Audit Command

Structured analysis with skill delegation:

```yaml
---
description: Audit a skill for quality and best practices
argument-hint: <skill-path>
---
```

```markdown
When invoked:

1. Resolve $ARGUMENTS to a skill directory containing SKILL.md
2. Apply the skill-development quality checklist
3. Report critical, warning, and suggestion findings
4. Include concrete fixes for each issue
```

## Scaffold Command

Guided creation with user checkpoints:

```markdown
When invoked:

1. Validate the requested name is kebab-case
2. Create the directory structure
3. Generate starter files from templates
4. Run lint-staged on staged files
5. Summarize next steps for the user
```

## Read-Only Analysis Command

Restrict tools for safe review:

```yaml
---
description: Analyze plugin structure without modifying files
allowed-tools: Read, Grep, Glob, Bash
---
```

## Interactive Command

Pause for decisions when multiple valid options exist:

```markdown
When multiple layout options apply, ask the user to choose before writing files.
Present options as a numbered list with tradeoffs.
```

## Output Format Block

End commands with explicit report structure:

```markdown
## Output Format

Produce markdown with:

- Summary (pass/fail or grade)
- Findings grouped by severity
- File references using path:line when applicable
- Recommended next steps
```

## Naming Conventions

- One command per file in `commands/`
- Prefer verb-noun names: `validate-plugin`, `audit-skill`, `create-hook`
- Namespace is automatic via plugin name; avoid redundant prefixes in filenames
