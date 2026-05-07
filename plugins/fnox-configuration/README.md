# fnox-configuration

Configuring Fnox secrets management via `fnox.toml` — file structure, secrets definition, profiles, and hierarchical configurations via mise integration.

## Installation

```bash
/plugin install fnox-configuration@meaganewaller-marketplace
```

## Components

### Skills

- **fnox-configuration** — Guides fnox setup via `fnox.toml`, profiles, hierarchical config, mise integration, import/export, and sync. Always uses fnox as a mise integration.

  References:
  - `mise-integration.md` — Mise plugin setup and environment-specific config
  - `profiles.md` — Multi-environment profiles (dev/staging/production)
  - `hierarchical-config.md` — Monorepo/multi-service secret organization
  - `import-export.md` — Migrating from `.env`, exporting secrets
  - `sync.md` — Caching remote secrets locally with age encryption

### Commands

(None yet)

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## Usage

This plugin activates when you are:

- Setting up fnox in a project (`fnox.toml` configuration)
- Creating or switching profiles for different environments
- Organizing secrets across a monorepo with hierarchical config
- Migrating from `.env` files to encrypted fnox secrets
- Syncing remote provider secrets (1Password, AWS) to a local age cache

**Always use the mise integration** — configure fnox via `mise.toml`, not shell hooks.

```toml
# mise.toml — minimum required setup
[plugins]
fnox-env = "https://github.com/jdx/mise-env-fnox"

[tools]
fnox = "latest"

[env]
_.fnox-env = { tools = true }
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
