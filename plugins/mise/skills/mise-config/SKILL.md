---
created: 2026-05-08
modified: 2026-05-08
reviewed: 2026-05-08
name: mise-config
description: |
  mise.toml configuration structure, config file hierarchy, environment variable
  setup, and idiomatic version file integration. Use when the user asks about
  configuring mise, editing mise.toml, setting env vars in mise, understanding
  how config cascades, or migrating from .nvmrc/.ruby-version/.python-version to mise.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit
---

# mise Config

Expert guidance for `mise.toml` structure, configuration hierarchy, and project setup.

## Core Concepts

- **mise.toml** — shared project config, committed to version control
- **mise.local.toml** — private overrides, git-ignored
- **Global config** — `~/.config/mise/config.toml`, applies everywhere
- **Cascading hierarchy** — lower levels override higher levels; see [Config Hierarchy](references/config-hierarchy.md)

## mise.toml Structure

```toml
# Tool versions
[tools]
node = "22"
python = "3.12"
ruby = "3.3"

# Environment variables
[env]
DATABASE_URL = "postgres://localhost/myapp_dev"
NODE_ENV = "development"

# PATH additions
[env]
_.path = ["./bin", "./node_modules/.bin"]

# Tasks
[tasks.test]
run = "bun test"
description = "Run test suite"

[tasks.lint]
run = "bunx biome check ."
description = "Run linter"
```

## Tool Version Syntax

Specify versions loosely to allow flexibility across team members:

```toml
[tools]
node = "22"          # Any 22.x — recommended
node = "22.1.0"      # Exact pin — use only when required
node = "latest"      # Latest stable — avoid in shared config
node = "lts"         # Latest LTS
python = "3"         # Any 3.x
```

Multiple versions for the same tool:

```toml
[tools]
python = ["3.12", "3.11"]  # Primary first, fallback second
```

## Environment Variables

Set project-scoped env vars in `[env]`:

```toml
[env]
APP_ENV = "development"
DATABASE_URL = "postgres://localhost/myapp_dev"
LOG_LEVEL = "debug"

# Reference other env vars
API_URL = "https://{{env.HOSTNAME}}/api"

# Add to PATH
_.path = ["./bin", "{{env.HOME}}/.local/bin"]

# Source a .env file
_.file = ".env"
```

For secrets and sensitive values, keep them in `mise.local.toml` (git-ignored) or use the fnox plugin for encrypted secrets management.

## Idiomatic Version Files

mise can read `.nvmrc`, `.ruby-version`, `.python-version`, and similar files automatically. See [Idiomatic Version Files](references/idiomatic-version-files.md) for details on enabling this and migrating to `mise.toml`.

## Config Hierarchy

Config cascades from global → workspace → project → local. See [Config Hierarchy](references/config-hierarchy.md) for the full resolution order and override rules.

## Common Operations

```bash
# Edit mise.toml interactively
mise edit

# Edit global config
mise edit --global

# View resolved config (after cascade)
mise config

# Set a tool version (adds to mise.toml)
mise use node@22

# Set an env var
mise set MY_VAR=value

# Show all current env vars from mise
mise env
```

## Best Practices

- Commit `mise.toml` to version control; add `mise.local.toml` to `.gitignore`
- Use loose version pins (e.g., `"22"` not `"22.1.0"`) unless exact reproducibility is required
- Keep secrets in `mise.local.toml` or encrypted via fnox, never in shared `mise.toml`
- Define all project tasks in `mise.toml` so new contributors can run `mise run` immediately
- Run `mise trust` once per project to authorize the config file before `mise install`
