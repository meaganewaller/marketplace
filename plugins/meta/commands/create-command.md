---
description: Scaffold a new slash command in a Claude Code plugin using meta conventions
argument-hint: <plugin-path> <command-name> <description>
arguments:
  - name: plugin
    description: Path to the plugin (e.g. plugins/meta, plugins/git)
    required: true
  - name: command-name
    description: Kebab-case command name (filename without .md)
    required: true
  - name: description
    description: Brief description for frontmatter and README
    required: true
  - name: skill
    description: Optional skill name to delegate complex logic (e.g. plugin-structure)
    required: false
---

# Create Command

Scaffold a new slash command in a Claude Code plugin. Part of the **meta** plugin —
use this when adding commands to marketplace plugins or any plugin under development.

Invoked as `/plugin-name:command-name` after install (for example `/git:gh-pr-create` or
`/meta:validate-plugin`).

## Usage

```text
/meta:create-command plugins/meta audit-hook Audit hook configuration quality
/meta:create-command plugins/git sync-issues Sync open issues to a local cache plugin-structure
```

When `$skill` is provided, include a delegation step in the generated command body.

## Instructions

Follow these steps in order. Apply the **command-development** skill throughout.

### 1. Parse and validate inputs

- Resolve `$plugin` to an absolute or repo-relative plugin directory
- Resolve `$command-name` and `$description` from arguments; if `$ARGUMENTS` is a single
  string, split on the first two tokens for path and name, remainder as description
- Validate `$command-name` is kebab-case (lowercase letters, numbers, hyphens only)
- Confirm `$plugin/.claude-plugin/plugin.json` exists; stop with a clear error if not
- Read `plugin.json` to get the plugin `name` for namespace examples in the scaffold
- Confirm `$plugin/commands/$command-name.md` does not already exist

### 2. Choose command pattern

Pick the best fit before writing the file:

| Pattern | Use when |
| --- | --- |
| **Audit** | Read-only analysis with severity-ranked report |
| **Scaffold** | Creates files and runs lint (like this command) |
| **Action** | Performs a workflow with tool use |
| **Thin delegate** | Command invokes a skill for shared logic |

If `$skill` is set, use **thin delegate**. Otherwise infer from `$description` or ask
the user when ambiguous.

See `skills/command-development/references/patterns.md` in the meta plugin for examples.

### 3. Generate the command file

Create `$plugin/commands/$command-name.md` with:

**Frontmatter** (required fields):

```yaml
---
description: <description from user input>
argument-hint: <hint if command takes args, else omit>
---
```

Add `allowed-tools` only when the command should be read-only (audits, analysis).

**Body structure:**

1. `# Title` — human-readable command name
2. Brief purpose (one sentence, written for Claude)
3. `## Usage` — example invocations using `/plugin-name:command-name`
4. `## Instructions` — numbered steps in imperative form, instructions **to Claude**
5. `## Output Format` — when the command produces a report or structured result

**Writing rules** (from meta command-development):

- Write instructions to Claude, not explanatory text to the user
- Use imperative form ("Resolve target", "Report findings")
- Reference a skill by name when delegating: "Apply the **skill-name** skill"
- Use `$ARGUMENTS`, `$1`, `$2` for dynamic input where appropriate
- Do not duplicate long guidance that belongs in a skill — link/delegate instead

**Starter template** (adapt pattern and steps to the user's description):

```markdown
---
description: <description>
argument-hint: <path-or-arg>
---

# <Title>

<One-sentence purpose for Claude.>

## Usage

\`\`\`text
/<plugin-name>:<command-name> <example-arg>
\`\`\`

## Instructions

When invoked:

1. **Resolve input** — Use $ARGUMENTS as ...
2. **<Core step>** — ...
3. **Report** — ...

## Output Format

<Structured markdown template when applicable>
```

### 4. Update plugin README

Add an entry under `### Commands` in `$plugin/README.md`:

```markdown
- **`/<plugin-name>:<command-name>`** — <description>
```

Keep commands listed in the same style as sibling entries. If the section says
"(None yet)", replace it with the first command entry.

### 5. Lint (marketplace plugins only)

When `$plugin` is under `plugins/` in `meaganewaller-marketplace`:

```bash
git add "$plugin/commands/$command-name.md" "$plugin/README.md"
bun run lint-staged
```

Fix common issues:

- **MD040** — add language tags to fenced code blocks (`text`, `bash`, `yaml`)
- **cspell** — add unknown words to `cspell.json` or rephrase

Re-run until lint-staged passes.

### 6. Summarize for the user

Report:

- File created: `$plugin/commands/$command-name.md`
- Invocation: `/<plugin-name>:<command-name>`
- Suggested follow-ups from meta:
  - `/meta:validate-plugin $plugin` — check plugin layout and registration
  - Refine instructions after a trial run
  - Extract reusable logic into a skill if the command body grows past ~80 lines

## Meta toolkit context

The meta plugin provides complementary commands:

| Command | Purpose |
| --- | --- |
| `/meta:create-command` | Scaffold a new command (this workflow) |
| `/meta:validate-plugin` | Audit plugin structure and marketplace registration |
| `/meta:audit-skill` | Audit skill quality and trigger phrases |

Prefer **command + skill** over monolithic commands: keep slash commands thin and move
reusable guidance into `skills/<name>/SKILL.md`.
