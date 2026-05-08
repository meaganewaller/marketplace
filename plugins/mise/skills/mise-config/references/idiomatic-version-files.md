# Idiomatic Version Files

mise can read tool versions from the idiomatic version files used by other version managers, enabling gradual adoption without breaking existing workflows.

## Supported Files

| File | Tool | Manager |
|------|------|---------|
| `.node-version` | node | nvm, nodenv |
| `.nvmrc` | node | nvm |
| `.ruby-version` | ruby | rbenv, rvm |
| `.python-version` | python | pyenv |
| `.java-version` | java | jenv |
| `.go-version` | go | goenv |
| `.erlang-version` | erlang | kerl |
| `.elixir-version` | elixir | kiex |
| `.terraform-version` | terraform | tfenv |

## Enabling Globally

Enable all idiomatic version files in your global mise config:

```toml
# ~/.config/mise/config.toml
[settings]
idiomatic_version_file_enable_tools = ["node", "python", "ruby"]
# or enable all:
idiomatic_version_file_enable_tools = "all"
```

Or per-project in `mise.toml`:

```toml
[settings]
idiomatic_version_file_enable_tools = ["node"]
```

## Migration Options

When running `/mise-init` on a project that has idiomatic version files, you have three choices:

### Option A — Keep idiomatic files, enable in mise.toml

Best when other team members still use nvm/rbenv/pyenv:

```toml
# mise.toml
[settings]
idiomatic_version_file_enable_tools = ["node", "ruby"]

# No [tools] section needed — versions come from .nvmrc, .ruby-version
```

### Option B — Move versions into mise.toml, delete idiomatic files

Best for teams fully committed to mise:

```toml
# mise.toml
[tools]
node = "22"    # Migrated from .nvmrc
ruby = "3.3"   # Migrated from .ruby-version
```

Then delete `.nvmrc`, `.ruby-version`, etc.

### Option C — Keep both (transitional)

`mise.toml` [tools] takes precedence over idiomatic files when both exist. Safe during migration:

```toml
# mise.toml
[tools]
node = "22"   # Takes precedence over .nvmrc
```

`.nvmrc` still works for teammates using nvm; mise ignores it for the node entry since `[tools]` is explicit.

## Checking What mise Reads

```bash
# See which config files are active and where versions come from
mise config

# Confirm the resolved version for a tool
mise current node
```
