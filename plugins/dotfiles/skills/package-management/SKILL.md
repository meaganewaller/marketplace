---
name: package-management
description: Adding tools to the dotfiles repo — when to use mise, when Homebrew, when an external, when npm/cargo/pipx, when to escalate to the package-manager subagent. Covers pinning, Renovate compatibility, and the /install command. Triggers on "add a tool", "install package", "add to mise", "add to brewfile", "pin a version", "Renovate", "npm global", "bulk version bump", "Docker Compose image", "devcontainer".
---

# Package management

The dotfiles install a lot of CLIs. Where you add a new one determines who can maintain it, what gets pinned, and whether Renovate can update it.

## Decision tree

```text
Is it a CLI / runtime (binary on PATH)?
├── Yes ────────────────────────────────────► mise (preferred)
│                                              home/dot_config/mise/config.toml
│
└── No, it's a GUI app / system package (macOS)
    ├── Yes ────────────────────────────────► Homebrew cask or brew
    │                                          home/.chezmoidata/packages.yaml
    │
    └── No, it's a shell/tmux/editor plugin
        └─────────────────────────────────► Chezmoi external
                                             home/.chezmoiexternals/
```

When in doubt, **prefer mise**. It's the strongest pinning story (lockfile + Renovate-friendly), works on both macOS and Linux, and keeps `~/.local/share/` reproducible.

## Use `/install <name>` for routine adds

The dotfiles ship a `/install` skill that:

- Picks the right manifest based on the tool type
- Pins to a specific version
- Follows existing alphabetization
- Updates the lockfile if needed

For one-off, unambiguous adds, run `/install <name>` and let it do the picking.

## When to escalate to the package-manager subagent

Use the **package-manager** agent (not `/install`) for:

- **Version conflicts or upgrade-policy calls** — e.g. "should Node go from 22 to 24?"
- **Docker Compose image tags / digests** — pinning rules differ
- **Devcontainer images and features** — `.devcontainer/devcontainer.json` and friends
- **Security-sensitive or bulk manifest edits** — e.g. pinning all GitHub Actions to digests
- **Renovate config churn** — `renovate.json5` rules, package files, group definitions
- **GitHub Actions versions/digests** — `.github/workflows/*.yml`
- **Chezmoi externals** — `home/.chezmoiexternal.toml.tmpl` and `home/.chezmoiexternals/`

Rationale: these manifests have non-obvious pinning conventions (commit digests vs tags vs `latest`), and bulk changes need careful Renovate-rule alignment. See the [Renovate doc](https://github.com/meaganewaller/dotfiles/blob/main/docs/renovate.md) for the full reasoning.

## mise — the default

`home/dot_config/mise/config.toml`:

```toml
[tools]
"aqua:bats-core/bats-core" = "v1.13.0"
"aqua:koalaman/shellcheck" = "v0.11.0"
node = "22"
ruby = "3.4.1"
"npm:markdownlint-cli" = "latest"
```

Backend priority (when both are available):

1. **aqua** — strongest provenance, checksums, signatures
2. **github** — direct release fetching
3. **pipx**, **npm**, **cargo** — language-specific package managers
4. **registry** — mise's default plugin set

Always pin to a specific version. `"latest"` is fine for tools where Renovate can bump it (npm, cargo); avoid it for aqua/github backends where it defeats the lockfile.

## Homebrew — for GUI / system packages

`home/.chezmoidata/packages.yaml`:

```yaml
darwin:
  brews:
    - mas        # mac app store CLI
    - mkcert     # system-level CA management
  casks:
    - ghostty
    - raycast
```

Brews here should be things mise *can't* provide — GUI apps, things that require `sudo`, things tied to macOS frameworks.

**Do not** add CLIs that mise supports to brews. Examples that go to **mise** instead of brew:

- `node`, `python`, `ruby`, `go`, `rust`
- `jq`, `yq`, `gh`, `git`, `gitleaks`, `shellcheck`
- `ripgrep`, `fd`, `bat`, `eza`

## Pinning rules

- **Always pin a version.** Even for `latest`-friendly tools, that pin is updated by Renovate — it's never absent.
- **Prefer tags over branches.** `v1.13.0`, not `main`.
- **Use SHAs for high-trust paths.** GitHub Actions and digest-pinned Docker images get commit SHAs, not tags (tags can move).

## Renovate

The repo's `renovate.json5` is set up to update:

- mise tool versions (lockfile + config.toml)
- Homebrew bundle pins where versioned
- Chezmoi externals where the URL embeds a version or SHA
- GitHub Actions (`.github/workflows/`)

If your new pin doesn't match an existing Renovate rule, the package-manager agent should review the change — manual updates that bypass Renovate quickly drift.

## After adding a package

```bash
# 1. Preview the change
chezmoi diff

# 2. Apply
chezmoi apply

# 3. For mise: also install
mise install

# 4. Verify it works
<tool> --version
```

For Homebrew, the `run_onchange_install-packages-darwin.sh` will pick up the change automatically on next apply.

## Linux notes

- Most CLIs that work on macOS via mise work identically on Linux.
- Brews are macOS-only; add a `linux:` section to `packages.yaml` with `apt`/`dnf`/`pacman` for Linux-equivalent system packages.
- Casks have no Linux equivalent — handle GUI apps via flatpak/snap in a Linux-specific script.

## Related

- [[chezmoi-data]] — for the YAML structure of `packages.yaml`
- [[chezmoi-externals]] — for plugin-style content (zsh, tmux, ghostty themes)
- [[chezmoi-scripts]] — for the install scripts that read `packages.yaml`
