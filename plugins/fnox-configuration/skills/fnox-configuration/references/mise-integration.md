# Mise Integration Reference

Fnox integrates with mise through the `jdx/mise-env-fnox` env plugin. This is the **only** supported integration — do not use `eval "$(fnox activate bash)"`.

## Basic Setup

```toml
# mise.toml
[plugins]
fnox-env = "https://github.com/jdx/mise-env-fnox"

[tools]
fnox = "latest"

[env]
_.fnox-env = { tools = true }
```

`tools = true` is required. Without it, the plugin runs before mise adds fnox to PATH.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `tools` | Use mise-managed fnox binary | `false` |
| `profile` | fnox profile to activate | `default` |
| `fnox_bin` | Explicit path to fnox binary | `fnox` |

## Profile per Environment

Use mise's environment system for per-environment profiles:

**`mise.toml`** (dev):

```toml
[plugins]
fnox-env = "https://github.com/jdx/mise-env-fnox"

[tools]
fnox = "latest"

[env]
_.fnox-env = { tools = true, profile = "dev" }
```

**`mise.staging.toml`**:

```toml
[env]
_.fnox-env = { tools = true, profile = "staging" }
```

**`mise.production.toml`**:

```toml
[env]
_.fnox-env = { tools = true, profile = "production" }
```

Activate:

```bash
MISE_ENV=staging mise env
MISE_ENV=production mise exec -- ./deploy.sh
```

## Caching

Enable mise's env cache for faster secret loading:

```bash
export MISE_ENV_CACHE=1
```

When enabled, secrets are cached encrypted on disk and only re-fetched when `fnox.toml` changes.

To clear the cache:

```bash
mise cache clear
```

## How It Works

When mise activates your environment, the fnox plugin:

1. Searches for `fnox.toml` in the current and parent directories
2. Resolves secrets from configured providers
3. Exports them as environment variables
4. Watches `fnox.toml` for changes to invalidate the cache

## Comparison with Shell Integration

| Feature | Shell Integration | Mise Integration |
|---------|------------------|-----------------|
| Automatic loading on `cd` | Yes | Yes (via mise) |
| Works without mise | Yes | No |
| Caching | No | Yes (with env cache) |
| Task integration | No | Yes |
| Tool version management | No | Yes |

Always use mise integration in projects that already use mise.
