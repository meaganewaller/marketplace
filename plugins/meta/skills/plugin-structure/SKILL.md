---
name: plugin-structure
description: >-
  This skill should be used when the user asks to "create a plugin", "scaffold a
  plugin", "validate a plugin", "understand plugin structure", "organize plugin
  components", "set up plugin.json", "register in marketplace", or needs
  guidance on Claude Code plugin layout, manifest configuration, or
  meaganewaller-marketplace registration.
---

# Plugin Structure

Guidance for organizing Claude Code plugins and validating marketplace layout.

## Standard Layout

```text
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Required manifest
├── commands/                # Slash commands (.md)
├── agents/                  # Subagent definitions (.md)
├── skills/                  # skill-name/SKILL.md
├── hooks/
│   └── hooks.json
├── .mcp.json                # Optional MCP config
├── src/                     # Optional MCP source
└── README.md
```

**Critical rules:**

1. Manifest must live at `.claude-plugin/plugin.json`
2. Component directories must be at plugin root, not inside `.claude-plugin/`
3. Use kebab-case for directory and file names
4. Create only directories the plugin actually uses

## Plugin Manifest

Minimum required field:

```json
{
  "name": "plugin-name"
}
```

Recommended fields for this marketplace:

```json
{
  "author": { "name": "meaganewaller" },
  "description": "Brief plugin purpose",
  "keywords": [],
  "license": "BlueOak-1.0.0",
  "name": "plugin-name",
  "version": "1.0.0"
}
```

Name must be kebab-case and unique among installed plugins.

## Component Discovery

| Component | Location | Format |
| --- | --- | --- |
| Commands | `commands/*.md` | Markdown + YAML frontmatter |
| Agents | `agents/*.md` | Markdown + YAML frontmatter |
| Skills | `skills/*/SKILL.md` | Directory per skill |
| Hooks | `hooks/hooks.json` | JSON event configuration |
| MCP | `.mcp.json` | MCP server definitions |

Custom paths in `plugin.json` supplement defaults; they do not replace them.

## Portable Paths

In hooks, scripts, and MCP config, use `${CLAUDE_PLUGIN_ROOT}` instead of
hardcoded absolute paths:

```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

## Marketplace Registration

New plugins in `meaganewaller-marketplace` must also be registered in:

1. `.claude-plugin/marketplace.json` — alphabetically by `name`
2. `release-please-config.json` — under `packages`, alphabetically by path
3. `.release-please-manifest.json` — initial version entry

Use `/create-plugin` or follow `references/marketplace-checklist.md` for the
full registration workflow. After scaffolding, run `bun run lint-staged` on
staged files.

## Validation Workflow

When validating an existing plugin:

1. Confirm directory layout and manifest fields
2. Verify component files use correct extensions and frontmatter
3. Check marketplace and release-please entries if this is a marketplace plugin
4. Confirm README documents installed components
5. Report findings by severity (critical, warning, suggestion)

For a command-driven audit, use `/meta:validate-plugin`. For scored validation with
README reconciliation and JSON output, delegate to the **plugin-validator** agent.

## Common Patterns

**Minimal plugin** — manifest + one command.

**Skill-focused plugin** — manifest + `skills/` only.

**Full-featured plugin** — commands, agents, skills, hooks, optional MCP.

## Additional Resources

- **`references/marketplace-checklist.md`** — Registration and lint steps for this repo
