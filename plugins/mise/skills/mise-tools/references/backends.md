# mise Backends Reference

mise installs tools from multiple backends. The registry shorthand covers the most common tools; use explicit backends for everything else.

## Registry (default)

Short names that resolve via mise's built-in registry:

```bash
mise use node@22
mise use python@3.12
mise use ruby@3.3
mise use go@1.22
mise use rust@1.78
mise use java@21
mise use deno@1
mise use bun@1
```

List all registry tools: `mise registry`

## npm

Install npm global packages as tools:

```bash
mise use npm:typescript@5
mise use npm:prettier@3
mise use npm:@biomejs/biome@1
```

In `mise.toml`:

```toml
[tools]
"npm:typescript" = "5"
"npm:prettier" = "3"
```

## Cargo (Rust)

Install Rust crates as tools:

```bash
mise use cargo:ripgrep@14
mise use cargo:fd-find@10
mise use cargo:tokei
```

Requires Rust/cargo installed. mise will use an existing cargo installation.

## pip

Install Python packages as isolated tools:

```bash
mise use pip:awscli@2
mise use pip:black@24
mise use pip:poetry@1
```

Requires Python available. Uses isolated virtual environments.

## ubi (GitHub Releases)

Install tools directly from GitHub releases:

```bash
mise use ubi:cli/cli           # GitHub CLI
mise use ubi:stedolan/jq
mise use ubi:BurntSushi/ripgrep
```

Format: `ubi:<owner>/<repo>`

## asdf (fallback)

Use asdf plugins for tools not in the registry:

```bash
mise use asdf:elixir@1.16
mise use asdf:erlang@26
mise use asdf:postgres@16
```

Format: `asdf:<plugin-name>[@version]`

## Explicit Backend in mise.toml

```toml
[tools]
node = "22"
"npm:typescript" = "5"
"cargo:ripgrep" = "14"
"ubi:cli/cli" = "latest"
"asdf:elixir" = "1.16"
```

## Choosing a Backend

| Scenario | Backend |
|---|---|
| Runtime (node, python, ruby, go) | Registry (shorthand) |
| npm CLI tool you'd normally `npm i -g` | npm |
| Rust CLI tool | cargo or ubi |
| Python CLI tool | pip |
| Anything on GitHub releases | ubi |
| Obscure tool with an asdf plugin | asdf |

## Listing Available Versions

```bash
# Registry tools
mise ls-remote node
mise ls-remote python | grep "^3\."

# npm packages
mise ls-remote npm:typescript

# No ls-remote for cargo/pip — check their respective registries
```
