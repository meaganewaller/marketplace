# dotfiles

Workflow plugin for a Chezmoi-managed dotfiles repository — opinionated toward the layout used in [meaganewaller/dotfiles](https://github.com/meaganewaller/dotfiles): `home/` as the source tree, `.chezmoidata/` for template data, `.chezmoiscripts/` for `run_onchange_*`, mise for pinned CLIs, BATS for tests, ADRs for decisions, Renovate for dependency PRs.

## Installation

```bash
/plugin install dotfiles@meaganewaller-marketplace
```

## What this plugin assumes

- **Source of truth lives in the repo, not in `~`.** All managed edits go under `home/` (or `private_*` for secrets). Hooks in this plugin actively block writes to managed destinations.
- **Chezmoi is the renderer.** `dot_*` → `~`, `dot_config/` → `~/.config/`, `private_*` for sensitive content, `.tmpl` for Go `text/template`.
- **mise pins tools.** New CLIs go through `/install` (or the package-manager agent for sensitive manifests).
- **BATS for tests, `./bin/test` to run.** Linting via `hk` / ShellCheck / markdownlint.

If your dotfiles repo follows a different layout, most skills still help — but the source-only hook and `/dotfiles-new-managed-file` command assume the `home/dot_*` convention.

## Components

### Skills

- **dotfiles-config** — Stores the repo path in `.claude/dotfiles.local.md` and reads it on subsequent invocations. Other skills route through this for the working tree.
- **chezmoi-workflow** — Edit → `chezmoi diff` → `chezmoi apply` → `chezmoi status` discipline; partial-apply patterns; troubleshooting drift.
- **chezmoi-templates** — Writing `.tmpl` files with Go `text/template`: `lookPath`, `stat`, `joinPath`, OS branching, data namespace.
- **chezmoi-data** — Updating YAML in `home/.chezmoidata/` and the templates that consume it (aliases, packages, themes).
- **chezmoi-externals** — Managing `home/.chezmoiexternals/*.toml` for third-party snippets; pinning to commit SHAs for Renovate compatibility.
- **chezmoi-scripts** — Authoring `run_once_*` and `run_onchange_*` scripts: idempotency, strict mode, `DEBUG` awareness, template-data inputs.
- **bats-testing** — Writing BATS specs under `test/`, using shared helpers (`assert_valid_shell`, `assert_script_structure`), running via `./bin/test`.
- **package-management** — `/install`-first routing, mise vs Homebrew vs aqua vs npm-global, when to escalate to the package-manager agent.
- **adr-writing** — Numbered ADRs under `docs/adrs/` in the existing format; cross-linking from AGENTS.md / README.

### Agents

- **chezmoi-source-guardian** — Handles cross-file refactors that involve renaming managed paths, moving content between templates and data files, or migrating `dot_*` → `private_*`. Keeps the source tree consistent.
- **package-manager** — Bulk and security-sensitive manifest edits: Docker Compose image tags, devcontainer features, GitHub Actions versions/digests, `home/.chezmoiexternal.toml.tmpl`, Renovate config churn.

### Hooks

- **source-only enforcement** (PreToolUse on Write/Edit) — Blocks writes to managed paths under `~` (`~/.zshrc`, `~/.config/mise/config.toml`, etc.), pointing you at the corresponding source under `home/`.
- **chezmoi-diff reminder** (PostToolUse on Write/Edit) — After editing under `home/`, prints a one-line nudge to run `chezmoi diff` before committing.

### Commands

- `/dotfiles-status` — `chezmoi diff` + `chezmoi status` + `mise doctor` in one shot.
- `/dotfiles-apply` — Preview-then-apply: `chezmoi diff` → confirm → `chezmoi apply` → `chezmoi status`.
- `/dotfiles-new-managed-file` — Walks you through placing a new file under `home/` with the correct `dot_` / `dot_config/` / `private_` prefix and optional `.tmpl`.
- `/dotfiles-new-adr` — Scaffolds the next-numbered ADR under `docs/adrs/` and adds it to the index.

## Configuration

This plugin stores its working-tree path in `.claude/dotfiles.local.md` (per-project) or `~/.claude/dotfiles.local.md` (global). The first time a skill needs the path, the **dotfiles-config** skill prompts and saves it.

To set it explicitly:

```markdown
---
repo_path: ~/src/github.com/meaganewaller/dotfiles
platform: darwin
---

# dotfiles plugin settings
```

## Usage

Typical flow when changing a dotfile:

```bash
# 1. Edit only in the source tree
vim ~/src/github.com/meaganewaller/dotfiles/home/dot_zshrc.tmpl

# 2. Preview
chezmoi diff

# 3. Apply (full or targeted)
chezmoi apply ~/.zshrc

# 4. Validate
chezmoi status
```

The `chezmoi-workflow` skill drives this loop, the hooks enforce step 1, and `/dotfiles-status` collapses steps 2 + 4 into one command.

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
