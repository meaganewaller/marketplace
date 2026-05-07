# Hierarchical Configuration Reference

Fnox searches parent directories for `fnox.toml` (or `.fnox.toml`) files and merges them. Ideal for monorepos.

## Directory Structure

```text
project/
├── fnox.toml              # Root config — shared providers and secrets
├── fnox.local.toml        # Root local overrides (gitignored)
└── services/
    ├── api/
    │   ├── fnox.toml      # API-specific secrets
    │   └── fnox.local.toml
    └── worker/
        ├── fnox.toml      # Worker-specific secrets
        └── fnox.local.toml
```

## Merge Order (lowest → highest priority)

When running from `project/services/api/`:

1. `~/.config/fnox/config.toml` (global config)
2. `project/fnox.toml` (root)
3. `project/fnox.local.toml` (root local overrides)
4. `project/services/api/fnox.toml` (current directory)
5. `project/services/api/fnox.local.toml` (current local overrides)

Child configs override parent; local configs override main at the same level.

## Example Setup

**`project/fnox.toml`** — shared secrets:

```toml
[providers]
age = { type = "age", recipients = ["age1..."] }

[secrets]
LOG_LEVEL = { default = "info" }
ENVIRONMENT = { default = "development" }
JWT_SECRET = { provider = "age", value = "encrypted-shared-jwt..." }
```

**`project/services/api/fnox.toml`** — API-specific:

```toml
[secrets]
API_PORT = { default = "3000" }
DATABASE_URL = { provider = "age", value = "encrypted-api-db..." }
LOG_LEVEL = { default = "debug" }  # Overrides parent
```

**`project/services/worker/fnox.toml`** — worker-specific:

```toml
[secrets]
QUEUE_URL = { provider = "age", value = "encrypted-queue-url..." }
WORKER_CONCURRENCY = { default = "4" }
```

## Resulting Secrets

From `project/services/api/`:

```text
ENVIRONMENT=development   # from root
JWT_SECRET=***            # from root
LOG_LEVEL=debug           # from api (overrides root's "info")
API_PORT=3000             # from api
DATABASE_URL=***          # from api
```

From `project/services/worker/`:

```text
ENVIRONMENT=development   # from root
JWT_SECRET=***            # from root
LOG_LEVEL=info            # from root (no override)
QUEUE_URL=***             # from worker
WORKER_CONCURRENCY=4      # from worker
```

## Hierarchy vs Imports

**Hierarchy** (automatic): walks up the directory tree, merges all `fnox.toml` files found.

**Imports** (explicit):

```toml
import = ["./shared/secrets.toml", "./envs/dev.toml"]
```

Use hierarchy for location-based config (monorepos). Use imports for cross-cutting shared secret bundles.

## Local Overrides

`fnox.local.toml` is for personal, machine-specific overrides. Never commit it.

```bash
echo "fnox.local.toml" >> .gitignore
```

```toml
# fnox.local.toml
[secrets]
DATABASE_URL = { default = "postgresql://localhost/mylocal" }
DEBUG_MODE = { default = "true" }
```

Provide a `fnox.local.toml.example` committed to the repo for team guidance.

## Global Configuration

Machine-wide secrets available to all projects:

```bash
fnox init --global
fnox set GITHUB_TOKEN "ghp_..." --global
fnox provider add age age --global
```

Location: `~/.config/fnox/config.toml`

Global config always loads, even when `root = true` stops parent directory recursion.

## Stop Directory Recursion

To prevent fnox from reading parent directories:

```toml
# fnox.toml
root = true
```

Global config still loads.

## Dotfile Variants

`.fnox.toml` works identically to `fnox.toml`. Use dotfiles to keep the root directory clean:

```text
.fnox.toml
.fnox.local.toml
.fnox.staging.toml
```

## Tips

- Keep root config minimal: only shared providers and shared secrets
- Service-specific secrets belong in subdirectory `fnox.toml` files
- Use `fnox config-files` to see which files are being loaded
- Profile inheritance works at each level — each `fnox.toml` can define profile-specific overrides
