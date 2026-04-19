# Skill Creator

Scaffolds Claude Code skills with proper structure, frontmatter, and progressive disclosure patterns.

## Installation

```bash
/plugin install skill-creator@meaganewaller-marketplace
```

## Components

### Commands

- `/create-skill <name> <description> [location]` — Scaffold a new skill with proper directory structure, frontmatter, and SKILL.md

### Skills

- `create-skill` — Expert knowledge for skill design patterns (auto-loaded when Claude is creating skills)

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## Usage

### Create a project skill

```text
/create-skill explain-code "Explains code with diagrams and analogies"
```

### Create a personal skill

```text
/create-skill daily-standup "Generate daily standup summary" personal
```

### Create a skill in a plugin

```text
/create-skill pr-review "Review PRs for correctness" plugin
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
