# Meta

Tools for building and evaluating Claude skills, hooks, agents, commands, and plugins — modular patterns, quality checks, and plugin validation.

## Installation

```bash
/plugin install meta@meaganewaller-marketplace
```

## Components

### Commands

- **`/meta:validate-plugin`** — Audit plugin layout, manifest, and marketplace registration
- **`/meta:audit-skill`** — Audit a skill for structure, triggers, and quality

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

### Validate a marketplace plugin

```text
/meta:validate-plugin plugins/meta
/meta:validate-plugin plugins/git
```

### Audit a skill

```text
/meta:audit-skill plugins/meta/skills/skill-development
/meta:audit-skill plugins/git/skills/git-commit
```

### Ask for authoring guidance

Skills auto-activate on phrases like "create a skill", "validate a plugin",
"add a PreToolUse hook", or "create a slash command".

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
