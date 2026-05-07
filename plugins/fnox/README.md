# fnox

Fnox secrets management — configuration, provider setup, and security best practices via mise integration.

## Installation

```bash
/plugin install fnox@meaganewaller-marketplace
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

- **fnox-providers** — Provider selection and setup guide covering age encryption, AWS, 1Password, and other backends.

  References:
  - `age.md` — Age encryption setup (recommended for dev, supports SSH keys)
  - `aws.md` — AWS Parameter Store and Secrets Manager
  - `cloud.md` — GCP, Azure, Doppler, HashiCorp Vault
  - `password-managers.md` — 1Password, Bitwarden, Infisical

- **fnox-security** — Security best practices: key rotation, gitignore rules, CI/CD patterns, access control, and avoiding common mistakes.

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
- Choosing or configuring a secrets provider (age, AWS, 1Password, etc.)
- Creating or switching profiles for different environments
- Organizing secrets across a monorepo with hierarchical config
- Migrating from `.env` files to encrypted fnox secrets
- Syncing remote provider secrets to a local age cache
- Reviewing or improving fnox security posture

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
