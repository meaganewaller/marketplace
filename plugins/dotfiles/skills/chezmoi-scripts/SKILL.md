---
name: chezmoi-scripts
description: Authoring run_once_* and run_onchange_* scripts under home/.chezmoiscripts/ — idempotency, strict mode, DEBUG awareness, template-data inputs, and how Chezmoi decides when to re-run them. Triggers on "run_onchange", "run_once", "chezmoi script", ".chezmoiscripts", "install packages script", "post-apply script", "trigger on apply".
---

# Chezmoi scripts

Scripts under `home/.chezmoiscripts/` run as part of `chezmoi apply`. They're how the dotfiles wire installer logic (Homebrew bundles, mise tool install, neovim plugin sync, macOS preference scripts) into the apply pipeline.

## When each prefix runs

| Prefix | Runs |
| --- | --- |
| `run_once_*` | Once per machine, ever. Chezmoi tracks "has this script run on this host?" in state. |
| `run_onchange_*` | Whenever the script's rendered content changes. Adding a new brew package to `packages.yaml` re-renders the install script and re-runs it. |
| `run_*` (no prefix) | Every `chezmoi apply`. Rare — usually you want one of the above. |
| `run_*_before_*` / `run_*_after_*` | Same as above but with ordering relative to file application. |

## Naming examples from the dotfiles

```text
home/.chezmoiscripts/
├── run_once_install-claude-code.sh
├── run_onchange_00-install-mise-tools.sh.tmpl
├── run_onchange_after_verify-theme-registry.sh.tmpl
├── run_onchange_configure-macos-preferences.sh.tmpl
├── run_onchange_install-nvim-plugins.sh.tmpl
├── run_onchange_install-packages-darwin.sh.tmpl
└── run_onchange_install-packages-linux.sh.tmpl
```

Numeric prefixes (`00-`, `99-`) order scripts within the same trigger class.

## Required boilerplate

Every script should:

```bash
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Optional debug helper, honors DEBUG=1
debug() { [[ "${DEBUG:-0}" == "1" ]] && echo "[debug] $*" >&2 || true; }
```

The dotfiles' convention is **strict mode always**, **`DEBUG`-aware**, **idempotent** (re-running causes no damage), and **defensive** (check for required binaries before destructive steps).

## Idempotency patterns

Every script may run on a fresh machine or a tenth re-apply. Both must succeed.

```bash
# Good — check before install
if ! command -v fnm >/dev/null 2>&1; then
  curl -fsSL https://fnm.vercel.app/install | bash
fi

# Good — let brew bundle no-op on already-installed
brew bundle --file=-  <<EOF
brew "git"
brew "jq"
EOF

# Bad — fails on second run
mkdir ~/.config/foo
```

`mkdir -p`, `ln -sf`, and tool-native "install if missing" subcommands are your friends. Avoid `rm -rf` unless you're explicit about *why* and gate it on a sentinel file.

## Template data inputs

`.tmpl` scripts can pull data from `.chezmoidata/` just like config templates do:

```gotmpl
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

brew bundle --file=- <<'EOF'
{{- range .packages.darwin.brews }}
brew "{{ . }}"
{{- end }}
{{- range .packages.darwin.casks }}
cask "{{ . }}"
{{- end }}
EOF
```

When the data changes, the rendered script changes, and Chezmoi re-runs it.

## DEBUG awareness

The dotfiles' install script and several scripts honor `DEBUG=1`:

```bash
debug "About to run brew bundle"
DEBUG=1 chezmoi apply -v   # show all script output
```

Useful inside scripts:

```bash
[[ "${DEBUG:-0}" == "1" ]] && set -x
```

`set -x` traces every command. Only enable behind `DEBUG` so normal apply output stays readable.

## Defensive guards

Before doing anything destructive or environment-touching:

```bash
# Required binary
command -v brew >/dev/null 2>&1 || {
  echo "brew is required but not installed" >&2
  exit 1
}

# Right OS
[[ "$(uname -s)" == "Darwin" ]] || exit 0
```

Returning `exit 0` from a wrong-OS guard is intentional: the script ran "successfully" because it had nothing to do.

## How `run_onchange_*` detects changes

Chezmoi computes a hash of the **rendered** script content (after template substitution) and stores it in state. On the next apply, if the hash differs, the script re-runs. Implications:

- **Editing the data file** that the script consumes (re-render → new hash → re-run) is the normal trigger.
- **Editing the script logic** also triggers a re-run.
- **Adding/removing whitespace** in the rendered output triggers a re-run — usually fine but can be noisy.
- If you want a script to re-run even though content didn't change, edit it cosmetically (a comment line is enough) or use `chezmoi state delete-bucket --bucket=scriptState`.

## Testing scripts locally

```bash
# Render only, don't apply
chezmoi execute-template < home/.chezmoiscripts/run_onchange_install-packages-darwin.sh.tmpl

# Dry-run the apply
chezmoi apply -nv

# Force re-run all run_onchange scripts
chezmoi state delete-bucket --bucket=scriptState
chezmoi apply
```

For unit testing the shell logic itself, see [[bats-testing]] — the dotfiles use BATS for this.

## Linux notes

- `run_onchange_install-packages-darwin.sh.tmpl` is gated on `{{ if eq .chezmoi.os "darwin" }}` at the top so it no-ops on Linux.
- Counterpart `run_onchange_install-packages-linux.sh.tmpl` does the same the other direction.
- `configure-macos-preferences` has no Linux equivalent.

## Related

- [[chezmoi-data]] — the data files that drive these scripts
- [[chezmoi-templates]] — the template syntax used inside `.tmpl` scripts
- [[bats-testing]] — testing shell logic from scripts
- [[package-management]] — when "install a package" belongs in a script vs mise vs Homebrew
