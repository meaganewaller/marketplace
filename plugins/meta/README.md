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
- **`/meta:rules-eval`** — Evaluate Cursor rules, `CLAUDE.md`, and `AGENTS.md`
- **`/meta:hooks-eval`** — Evaluate hooks with optional test script execution

### Skills

- **skill-development** — Author and evaluate `SKILL.md` files with progressive disclosure
- **plugin-structure** — Plugin layout, manifest rules, and marketplace registration
- **command-development** — Slash command structure, frontmatter, and patterns
- **hook-development** — Hook events, `hooks.json` format, and `${CLAUDE_PLUGIN_ROOT}` paths

### Agents

(None yet)

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

### Audit or test a skill

```text
/meta:audit-skill plugins/meta/skills/skill-development
/meta:test-skill plugins/git/skills/git-commit medium
/meta:skills-eval plugins/meta
/meta:skills-eval plugins/git --deep
```

### Evaluate rules and hooks

```text
/meta:rules-eval .cursor/rules
/meta:rules-eval CLAUDE.md
/meta:hooks-eval plugins/git --run-tests
```

### Ask for authoring guidance

Skills auto-activate on phrases like "create a skill", "validate a plugin",
"add a PreToolUse hook", or "create a slash command".

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
