# mise Config Hierarchy

mise merges configuration from multiple files, with lower (more specific) levels overriding higher (more general) ones.

## Resolution Order

From lowest precedence (most general) to highest (most specific):

```text
~/.config/mise/config.toml          # Global — applies everywhere
~/.config/mise/config.local.toml    # Global local — machine-specific, git-ignored

<workspace-root>/mise.toml          # Workspace — monorepo root
<workspace-root>/mise.local.toml    # Workspace local

<project-dir>/mise.toml             # Project — shared, committed
<project-dir>/mise.local.toml       # Project local — private, git-ignored

<project-dir>/.env                  # Sourced if _.file = ".env" is set
```

Higher entries in this list are overridden by lower entries.

## What Gets Merged vs Overridden

**Tools** — overridden at each level. If global sets `node = "20"` and project sets `node = "22"`, the project wins with `22`.

**Environment variables** — merged, with lower levels winning on conflicts. Setting `DATABASE_URL` in `mise.local.toml` overrides the value from `mise.toml`.

**Tasks** — merged. Tasks defined at the project level supplement (not replace) tasks from global config. A project task with the same name as a global task overrides it.

## Example Cascade

```toml
# ~/.config/mise/config.toml (global)
[tools]
node = "20"
ripgrep = "14"

[env]
EDITOR = "nvim"
```

```toml
# ~/projects/myapp/mise.toml (project)
[tools]
node = "22"       # Overrides global node@20
python = "3.12"   # Added; not in global

[env]
DATABASE_URL = "postgres://localhost/myapp_dev"
# EDITOR still comes from global
```

```toml
# ~/projects/myapp/mise.local.toml (project local, git-ignored)
[env]
DATABASE_URL = "postgres://localhost/myapp_local"  # Overrides project
```

Resolved environment when working in `~/projects/myapp`:

- `node` → 22 (project overrides global)
- `python` → 3.12 (project only)
- `ripgrep` → 14 (global only)
- `EDITOR` → nvim (global only)
- `DATABASE_URL` → postgres://localhost/myapp_local (local overrides project)

## Workspace Support

For monorepos, mise supports a workspace root config:

```text
monorepo/
├── mise.toml          # Workspace — shared tools for all packages
├── packages/
│   ├── api/
│   │   └── mise.toml  # Package — overrides workspace for this package
│   └── web/
│       └── mise.toml  # Package — overrides workspace for this package
```

Configure the workspace root in `mise.toml`:

```toml
[workspace]
members = ["packages/*"]
```

## Viewing the Resolved Config

```bash
# Show all active config files and their values after merging
mise config

# Show only env vars after resolution
mise env

# Show tool versions after resolution
mise current
```

## The .local.toml Pattern

Always add `*.local.toml` to `.gitignore`:

```gitignore
mise.local.toml
```

Use `mise.local.toml` for:

- Machine-specific tool versions
- Local database URLs and ports
- Developer-specific env vars
- Secrets (prefer fnox for encrypted secrets)
