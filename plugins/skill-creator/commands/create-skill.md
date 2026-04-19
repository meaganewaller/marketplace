---
description: Create a new Claude Code skill with proper structure and frontmatter
arguments:
  - name: name
    description: Skill name in kebab-case (e.g., explain-code)
    required: true
  - name: description
    description: What the skill does and when to use it
    required: true
  - name: location
    description: "Where to create: project (default), personal, or plugin"
    required: false
argument-hint: <name> <description> [location]
---

# Create Skill

Create a new Claude Code skill named `$ARGUMENTS[0]` with description `$ARGUMENTS[1]`.

## Instructions

Follow these steps precisely:

### 1. Validate the skill name

- Must be kebab-case (lowercase letters, numbers, hyphens only, max 64 chars)
- Must not conflict with existing skills in the target location

### 2. Determine target location

Based on the `location` argument (default: `project`):

| Location | Path |
| --- | --- |
| `project` | `.claude/skills/$ARGUMENTS[0]/` |
| `personal` | `~/.claude/skills/$ARGUMENTS[0]/` |
| `plugin` | Ask which plugin, then `plugins/<plugin>/skills/$ARGUMENTS[0]/` |

### 3. Create the skill directory structure

```text
$ARGUMENTS[0]/
├── SKILL.md           # Main instructions (required)
└── references/        # Detail docs for progressive disclosure
```

### 4. Generate SKILL.md

Ask the user what the skill should do and create a SKILL.md with:

**Frontmatter** — include all relevant fields:

```yaml
---
name: $ARGUMENTS[0]
description: |
    $ARGUMENTS[1]
---
```

Consider adding these optional fields based on the use case:

- `user-invocable: false` — if the skill should only be auto-triggered by Claude
- `disable-model-invocation: true` — if the skill should only be manually invoked via `/name`
- `allowed-tools` — restrict which tools Claude can use (e.g., `Read, Grep, Glob`)
- `context: fork` — run in a subagent for isolation
- `agent` — which subagent type when using `context: fork` (e.g., `Explore`, `Plan`)
- `argument-hint` — hint shown in autocomplete (e.g., `[file-path]`)
- `model` — override model (e.g., `haiku` for fast tasks)
- `effort` — effort level: `low`, `medium`, `high`, `xhigh`, `max`
- `paths` — glob patterns limiting activation (e.g., `["src/**/*.ts"]`)

**Body** — write clear, actionable instructions. Use:

- Numbered steps for procedures
- Tables for reference data
- Code blocks for templates/examples
- `$ARGUMENTS` for user input
- `` !`command` `` for dynamic context injection

### 5. Keep it focused

- Main SKILL.md should be under 500 lines
- Move detailed reference material to `references/` subdirectory
- Use progressive disclosure: load references only when needed with instructions like "Read `references/advanced.md` for details"

### 6. Report what was created

Show the user:

1. The full path to the created skill
2. How to invoke it (`/skill-name` or describe auto-trigger conditions)
3. Suggest next steps (add references, test the skill, adjust frontmatter)
