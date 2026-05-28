---
name: chezmoi-externals
description: Managing third-party content fetched via Chezmoi externals — home/.chezmoiexternals/*.toml.tmpl files for zsh plugins, fish plugins, tmux plugins, ghostty themes. Pinning by commit SHA so Renovate can update them. Triggers on "chezmoi external", "chezmoiexternal", "zsh-autosuggestions", "tmux plugin", "fish plugin", "pin to commit", "Renovate dotfile", "third-party content".
---

# Chezmoi externals

Externals are Chezmoi's way of pulling third-party content (plugin repos, archives, single files) into the source tree at apply time. The dotfiles use them for shell plugins, tmux plugins, and ghostty themes.

## File layout

```text
home/.chezmoiexternals/
├── fish.toml.tmpl
├── ghostty.toml
├── tmux.toml.tmpl
└── zsh.toml.tmpl
```

One file per concern. `.tmpl` versions render with the usual Go template machinery (use this to skip externals on a platform that doesn't need them).

## Per-external shape

Each entry keys on the destination path *relative to the source tree root*. For shell plugins, that means under `home/dot_config/zsh/plugins/...`:

```toml
[".config/zsh/plugins/zsh-autosuggestions"]
    type = "archive"
    url = "https://github.com/zsh-users/zsh-autosuggestions/archive/v0.7.0.tar.gz"
    exact = true
    stripComponents = 1
    refreshPeriod = "168h"
```

Key fields:

- **`type`** — `file`, `archive`, `archive-file`, or `git-repo`
- **`url`** — source
- **`exact`** — drop destination contents not in the external (recommended for plugins)
- **`stripComponents`** — for archives, skip leading directory levels (set to `1` for GitHub's `<repo>-<sha>/...` wrapping)
- **`refreshPeriod`** — how often Chezmoi re-fetches; `168h` (1 week) is reasonable for stable releases

## Pinning for Renovate

Renovate updates externals only if the URL pins a specific commit SHA or release tag. Use **release tags** for stable plugins, **commit SHAs** for tools that don't tag:

```toml
# Good — Renovate-trackable
url = "https://github.com/zsh-users/zsh-autosuggestions/archive/v0.7.0.tar.gz"
url = "https://github.com/owner/repo/archive/abc123def456.tar.gz"

# Bad — Renovate can't pin a moving target
url = "https://github.com/owner/repo/archive/main.tar.gz"
url = "https://github.com/owner/repo/archive/HEAD.tar.gz"
```

The Renovate config in the repo (`renovate.json5`) is set up to match the URL pattern. When in doubt, check the existing externals for the URL shape Renovate expects, and copy that.

## Updating an external manually

For an emergency bump before Renovate catches up:

1. Find the new release tag or commit SHA upstream.
2. Edit the `url` in the relevant `.toml(.tmpl)`.
3. `chezmoi apply` (or `chezmoi apply ~/.config/zsh/plugins/...` for targeted).
4. Verify the plugin still loads (`reload!` in zsh, or restart the shell).
5. Commit with a `chore(deps):` or `chore(zsh):` prefix to match Renovate's convention.

## Don't fetch what mise can install

If a tool ships as a CLI release on GitHub, prefer mise's `aqua:` or `github:` backend in `home/dot_config/mise/config.toml`. Externals are for *content* (plugin scripts, themes) — not binaries.

## Securitygates

The dotfiles' `./install` script optionally verifies cosign signatures. External fetches don't go through that path; if you're adding an external from an untrusted source:

- Pin to an exact commit SHA (not a tag — tags can be moved).
- Read the code before adding it.
- Prefer official mirrors when they exist.

## Skipping externals on a platform

Wrap a `.tmpl` external in a conditional to skip on Linux (or vice versa):

```gotmpl
{{- if eq .chezmoi.os "darwin" }}
[".config/raycast/scripts"]
    type = "archive"
    url = "..."
{{- end }}
```

Or use `.chezmoiignore` for entire managed paths.

## Related

- [[chezmoi-templates]] — for templating logic inside externals
- [[package-management]] — for choosing between externals, mise, and Homebrew
