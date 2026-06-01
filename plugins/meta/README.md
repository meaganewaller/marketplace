# Meta

Tools for building and evaluating Claude skills, hooks, agents, commands, and plugins — modular patterns, quality checks, and plugin validation.

## Installation

```bash
/plugin install meta@meaganewaller-marketplace
```

## Components

### Commands

**Scaffolding**

- **`/meta:create-command`** — Scaffold a new slash command in a plugin

**Static validation**

- **`/meta:validate-plugin`** — Audit plugin layout, manifest, and marketplace registration
- **`/meta:validate-hook`** — Audit `hooks/hooks.json`, scripts, and portable paths
- **`/meta:audit-skill`** — Audit a skill for structure, triggers, and quality

**Evaluation**

- **`/meta:test-skill`** — Behavioral scenarios for a single skill
- **`/meta:skills-eval`** — Batch-evaluate all skills in a plugin or directory
- **`/meta:context-optimization-report`** — Context window footprint report, size tiers, and modularization priorities
- **`/meta:rules-eval`** — Evaluate Cursor rules, `CLAUDE.md`, and `AGENTS.md`
- **`/meta:hooks-eval`** — Evaluate hooks with optional test script execution

### Skills

- **skill-development** — Author and evaluate `SKILL.md` files with progressive disclosure
- **modular-skill-framework** — Composable skill design: boundaries, interfaces, and token efficiency
- **plugin-structure** — Plugin layout, manifest rules, and marketplace registration
- **command-development** — Slash command structure, frontmatter, and patterns
- **hook-development** — Hook events, `hooks.json` format, and `${CLAUDE_PLUGIN_ROOT}` paths

### Agents

- **plugin-validator** — Scored plugin validation (layout, manifest, marketplace registration, README inventory, hooks/MCP)
- **skill-auditor** — Scored skill quality audits (structure, content, token efficiency, activation, tool integration); plugin or single-skill scope

### Hooks

(None yet)

### MCP Servers

(None yet)

## Usage

This plugin activates when you are:

- Creating or refining Claude Code skills, hooks, agents, or slash commands
- Evaluating plugin structure, naming, and component organization
- Applying modular patterns for progressive disclosure and reusable references
- Running quality checks on skill descriptions, trigger phrases, and frontmatter
- Assessing skill portfolio token efficiency before publishing plugins
- Validating marketplace plugin layout, `plugin.json`, and release configuration

### Scaffold a slash command

```text
/meta:create-command plugins/meta my-command Brief description of what it does
/meta:create-command plugins/git sync-labels Sync GitHub labels to local config
```

### Validate a plugin or hooks

```text
/meta:validate-plugin plugins/meta
/meta:validate-hook plugins/git
```

Delegate a scored plugin audit to the **plugin-validator** agent (e.g.
`output=json-analysis` or `include-skills=true` for a skill summary). See
`agents/plugin-validator.md`.

### Audit or test a skill

```text
/meta:audit-skill plugins/meta/skills/skill-development
/meta:test-skill plugins/git/skills/git-commit medium
/meta:skills-eval plugins/meta
/meta:skills-eval plugins/git --deep
/meta:context-optimization-report plugins/meta
/meta:context-optimization-report plugins/ruby-rails --top 10
```

Delegate a scored audit to the **skill-auditor** agent (e.g. full plugin review with
`output=json-analysis` or `output=improvement-plan`). See `agents/skill-auditor.md`.

### Evaluate rules and hooks

```text
/meta:rules-eval .cursor/rules
/meta:rules-eval CLAUDE.md
/meta:hooks-eval plugins/git --run-tests
```

### Ask for authoring guidance

Skills auto-activate on phrases like "create a skill", "modular skills",
"split a skill", "validate a plugin", "add a PreToolUse hook", or
"create a slash command".

The **plugin-validator** agent triggers on "validate a plugin", "plugin structure
audit", or "marketplace registration check".

The **skill-auditor** agent triggers on "audit a skill", "skill quality review", or
"evaluate skills in a plugin".

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
