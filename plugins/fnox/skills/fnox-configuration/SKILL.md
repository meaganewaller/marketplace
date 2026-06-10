---
name: fnox-configuration
description: 'Guides fnox secrets management configuration via fnox.toml — file structure, secrets definition, profiles, hierarchical config, mise integration, import/export, and sync. Always use fnox as a mise integration, never as standalone shell integration. Triggers on: "set up fnox", "fnox.toml", "configure fnox", "fnox profiles", "fnox secrets", "mise fnox", "migrate to fnox", "fnox sync", "fnox import", "fnox export".'
---

# Fnox Configuration

Fnox is a secrets manager ("Fort Knox for your secrets") that stores encrypted secrets in `fnox.toml` and integrates with mise to load them as environment variables.

**Key rule: always configure fnox through the mise integration, not shell integration.**

## When to Use This Skill

Use this skill when:

- Setting up or configuring fnox in a project
- Defining secrets in `fnox.toml`
- Creating or managing profiles (dev, staging, production)
- Configuring hierarchical secrets across monorepo services
- Migrating from `.env` files to fnox
- Syncing remote provider secrets to a local cache
- Troubleshooting secret loading issues

## When NOT to Use This Skill

- Managing secrets with a different tool (Vault, Doppler, AWS SSM directly) — use their native tooling
- General `.env` file questions not involving fnox
- Setting up mise itself (without fnox) — use mise documentation
- Storing secrets as environment variables in CI without fnox — configure the CI provider directly

## Core Principles

1. **Mise integration only**: Configure via `mise.toml`, not `eval "$(fnox activate bash)"`
2. **`tools = true` is required**: Without it, mise runs the plugin before fnox is in PATH
3. **Profiles for environments**: Use `[profiles.staging.secrets]`, never separate `.env.staging` files
4. **Hierarchical for monorepos**: Child `fnox.toml` files override parent secrets
5. **`fnox.local.toml` for personal overrides**: Always gitignore it

## Mise Integration Setup

Every project using fnox must have this in `mise.toml`:

```toml
[plugins]
fnox-env = "https://github.com/jdx/mise-env-fnox"

[tools]
fnox = "latest"

[env]
_.fnox-env = { tools = true }
```

To use a specific profile:

```toml
[env]
_.fnox-env = { tools = true, profile = "staging" }
```

For per-environment mise files (`mise.staging.toml`, `mise.production.toml`):

```toml
# mise.staging.toml
[env]
_.fnox-env = { tools = true, profile = "staging" }
```

```bash
MISE_ENV=staging mise env   # activates staging profile
```

## fnox.toml File Structure

```toml
# Providers — how secrets are encrypted/stored
[providers]
age = { type = "age", recipients = ["age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p"] }

# Secrets — the default (development) profile
[secrets]
API_URL = { default = "http://localhost:3000" }
DATABASE_URL = { provider = "age", value = "AGE-ENCRYPTED..." }
LOG_LEVEL = { default = "info" }

# Profile-specific secrets
[profiles.staging.secrets]
API_URL = { default = "https://staging.example.com" }
DATABASE_URL = { provider = "age", value = "AGE-ENCRYPTED-STAGING..." }

[profiles.production.providers]
aws = { type = "aws-sm", region = "us-east-1" }

[profiles.production.secrets]
API_URL = { default = "https://api.example.com" }
DATABASE_URL = { provider = "aws", value = "prod/database-url" }
```

## Quick Reference

| Task | Command |
|------|---------|
| List secrets | `fnox list` |
| Get a secret | `fnox get DATABASE_URL` |
| Set a secret | `fnox set DATABASE_URL "value" --provider age` |
| Run with secrets | `fnox exec -- node server.js` |
| Use a profile | `fnox exec --profile production -- ./deploy.sh` |
| Export as .env | `fnox export` |
| Import from .env | `fnox import -i .env --provider age` |
| Sync to local cache | `fnox sync --provider age --config fnox.local.toml` |
| List profiles | `fnox profiles` |
| Check config files | `fnox config-files` |

## Progressive Disclosure

For detailed guidance on specific topics, load the appropriate reference:

- **Mise integration details** → Read `references/mise-integration.md`
- **Profiles (multi-environment)** → Read `references/profiles.md`
- **Hierarchical config (monorepos)** → Read `references/hierarchical-config.md`
- **Import / Export** → Read `references/import-export.md`
- **Syncing to local cache** → Read `references/sync.md`

## Gitignore Rules

Always add to `.gitignore`:

```text
fnox.local.toml
.fnox.local.toml
```

Commit `fnox.toml` (encrypted secrets are safe). Never commit `fnox.local.toml`.

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Secrets not loading | Verify `fnox.toml` exists; run `mise env` to check |
| `fnox: command not found` | Ensure `tools = true` in mise.toml env plugin config |
| Cache not refreshing | Run `mise cache clear` |
| Wrong profile loading | Check `FNOX_PROFILE` env var; verify `mise.toml` profile option |
| Parent secrets not merging | Check `fnox config-files` to see which files are loaded |
