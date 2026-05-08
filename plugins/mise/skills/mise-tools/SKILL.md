---
created: 2026-05-08
modified: 2026-05-08
reviewed: 2026-05-08
name: mise-tools
description: |
  Installing, pinning, and upgrading tool versions with mise. Backends (registry,
  asdf, cargo, npm, pip, ubi), mise use vs mise install, version resolution, and
  shim behavior. Use when the user asks about installing tools with mise, adding
  a runtime to a project, upgrading tool versions, switching between versions,
  or understanding mise backends and shims.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit
---

# mise Tools

Expert guidance for managing tool versions with mise.

## Installing Tools

### mise use — install and pin

`mise use` installs a tool AND adds it to `mise.toml`. Always use this when adding a tool to a project:

```bash
# Add to project mise.toml (current directory)
mise use node@22
mise use python@3.12
mise use ruby@3.3

# Add to global config (~/.config/mise/config.toml)
mise use --global node@22

# Install without modifying config (one-off)
mise install node@22.1.0
```

### mise install — set up from existing config

Run this after cloning a repo or editing `mise.toml` manually:

```bash
# Install all tools in mise.toml
mise install

# Install a specific tool
mise install node@22
```

## Version Syntax

```bash
mise use node@22          # Any 22.x (recommended)
mise use node@22.1.0      # Exact version
mise use node@latest      # Latest stable
mise use node@lts         # Latest LTS
mise use python@3         # Any Python 3.x
mise use ruby             # Latest stable (no version)
```

## Listing and Discovering Tools

```bash
# Show installed tools and their active versions
mise ls

# Show all available versions for a tool
mise ls-remote node
mise ls-remote node | tail -20   # Show recent versions

# Show what's currently active
mise current
mise current node
```

## Upgrading Tools

```bash
# Upgrade all tools to latest matching their constraints
mise upgrade

# Upgrade a specific tool
mise upgrade node
mise upgrade node@22     # Stay within major version

# Preview what would be upgraded (dry run)
mise upgrade --dry-run
```

## Backends

mise supports multiple installation backends. See [Backends Reference](references/backends.md) for full details.

**Short names** (registry shorthand — most common):

```bash
mise use node@22
mise use python@3.12
mise use ruby@3.3
mise use go@1.22
mise use rust@1.78
```

**Explicit backends:**

```bash
# npm global packages
mise use npm:typescript@5
mise use npm:prettier@3

# Cargo (Rust) tools
mise use cargo:ripgrep@14
mise use cargo:fd-find

# pip tools
mise use pip:awscli@2

# GitHub releases (ubi backend)
mise use ubi:cli/cli           # GitHub CLI
mise use ubi:BurntSushi/ripgrep

# asdf plugins (fallback for less common tools)
mise use asdf:elixir@1.16
```

## Shims vs PATH

mise activates tools in two modes:

**PATH mode** (recommended — requires shell activation):

```bash
# Add to shell rc (.zshrc, .bashrc)
eval "$(mise activate zsh)"
```

Tools are prepended to PATH when entering a directory. Use `mise exec` in scripts that run outside an activated shell.

**mise exec** (for scripts and CI):

```bash
# Run a command with mise's tool versions, no activation needed
mise exec -- node --version
mise exec -- bun test
```

## Troubleshooting

```bash
# Diagnose installation and activation issues
mise doctor

# See which version of a tool is active and why
mise which node
mise current node

# Verify a tool is on PATH after activation
which node
node --version
```
