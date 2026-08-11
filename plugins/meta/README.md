# Meta

Evaluation layer for Claude Code plugins — scored skill and plugin audits, hook and rules evals, and context-footprint reports against bundled checklists.

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

- **modular-skill-framework** — Composable skill design: boundaries, interfaces, and token efficiency

Meta deliberately ships one skill. It judges plugins rather than teaching how to
write them, so its criteria live in `references/` and load only when a command or
agent asks for them — nothing else is added to every session.

For authoring guidance (`SKILL.md` structure, command frontmatter, hook events,
plugin layout), use the **plugin-dev** plugin. Meta previously duplicated those
four skills at a fraction of the depth, which only created ambiguity about which
to follow.

### References

Judging criteria, loaded on demand:

- **`references/skill-quality-checklist.md`** — pass/fail criteria for a skill
- **`references/marketplace-checklist.md`** — layout, manifest, marketplace registration
- **`references/hook-checklist.md`** — `hooks.json` and hook script conventions
- **`references/command-patterns.md`** — command frontmatter and writing conventions

### Agents

- **plugin-auditor** — Scored plugin audit (layout, manifest, marketplace registration, README inventory, hooks/MCP)
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

Delegate a scored plugin audit to the **plugin-auditor** agent (e.g.
`output=json-analysis` or `include-skills=true` for a skill summary). See
`agents/plugin-auditor.md`.

### Audit or test a skill

```text
/meta:audit-skill plugins/meta/skills/modular-skill-framework
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

### Ask for composition guidance

The **modular-skill-framework** skill auto-activates on phrases like "modular
skills", "split a skill", "skill boundaries", or "skill composition". For how to
*write* a skill, command, or hook, use the **plugin-dev** plugin.

The **plugin-auditor** agent triggers on "audit a plugin", "score this plugin",
or "marketplace registration check".

The **skill-auditor** agent triggers on "audit a skill", "skill quality review", or
"evaluate skills in a plugin".

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
