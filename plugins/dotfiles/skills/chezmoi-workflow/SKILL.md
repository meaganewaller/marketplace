---
name: chezmoi-workflow
description: Day-to-day Chezmoi loop for a dotfiles repo — edit only in the source tree, preview with chezmoi diff, apply targeted or full, validate with chezmoi status. Covers partial apply, troubleshooting drift, and recovering from accidental edits in $HOME. Triggers on "chezmoi diff", "chezmoi apply", "chezmoi status", "dotfile change", "apply my dotfiles", "what changed in my dotfiles", "drift", "chezmoi destination is different".
---

# Chezmoi workflow

The repo is the source of truth. The machine converges to what is committed under `home/`. Never the other way around.

## The four-step loop

For every change to a managed file:

1. **Edit** the source — `home/dot_zshrc.tmpl`, never `~/.zshrc`.
2. **Preview** with `chezmoi diff`. Confirm only the intended paths change. If unrelated drift appears, investigate before applying (see troubleshooting below).
3. **Apply** — full (`chezmoi apply`) or targeted (`chezmoi apply ~/.zshrc ~/.config/mise/config.toml`). Prefer targeted when other drift exists.
4. **Validate** — `chezmoi status` should be clean. Remaining diffs mean partial apply or an edit outside the repo.

```bash
vim home/dot_zshrc.tmpl
chezmoi diff
chezmoi apply ~/.zshrc
chezmoi status
```

## Source ↔ destination mapping

| Destination | Source |
| --- | --- |
| `~/.zshrc` | `home/dot_zshrc` or `home/dot_zshrc.tmpl` |
| `~/.config/mise/config.toml` | `home/dot_config/mise/config.toml` |
| `~/.config/nvim/` | `home/dot_config/nvim/` |
| `~/.ssh/config` | `home/private_dot_ssh/config` |
| `~/Library/...` (macOS only) | `home/private_Library/...` |

Prefix rules:

- **`dot_`** → dotfile under `$HOME` (`dot_zshrc` → `.zshrc`)
- **`dot_config/`** → `~/.config/`
- **`private_`** → sensitive / machine-local; Chezmoi-encrypted
- **`.tmpl`** suffix → Go `text/template` rendered before write (see chezmoi-templates skill)
- **`run_onchange_*` / `run_once_*`** → scripts (see chezmoi-scripts skill)

## When `chezmoi diff` shows unexpected drift

Common causes, in order of likelihood:

1. **Someone (or some installer) wrote directly to `~`.** Confirm with `git -C "$(chezmoi source-path)" log -- <source-path>` — if the source hasn't changed but destination has, the destination was edited out of band. Decide: (a) bring the change into the source tree and apply, or (b) `chezmoi apply <target>` to overwrite the destination.
2. **`run_onchange_*` script content changed.** The hash at the top of the diff shifts, which is expected — that's how chezmoi triggers re-runs.
3. **Template data changed.** If a `.chezmoidata/*.yaml` file was edited, every template that consumes it re-renders.
4. **A different machine's `.chezmoi.toml`.** Templates that branch on `.chezmoi.os` or `.chezmoi.hostname` render differently on each machine.

## Partial apply

Use targeted apply liberally when working through multi-file changes:

```bash
# Apply just one file
chezmoi apply ~/.zshrc

# Apply a directory
chezmoi apply ~/.config/nvim

# Dry-run the apply with explanations
chezmoi apply -nv ~/.zshrc
```

`-n` (no-op) + `-v` (verbose) shows what would happen without writing.

## Recovering from edits in $HOME

If you edited a managed file in `~` by accident:

```bash
# 1. See what diverged
chezmoi diff ~/.zshrc

# 2a. If the edit is worth keeping: copy back to source
chezmoi re-add ~/.zshrc           # adds destination back into source

# 2b. If the edit is throwaway: just re-apply
chezmoi apply ~/.zshrc            # overwrites destination from source
```

`chezmoi re-add` is the inverse of `chezmoi apply` — useful but easy to misuse. Prefer 2b unless you're sure the destination edit was intentional.

## Validation cadence

After every applied change, run `chezmoi status` (cheap, just compares hashes). A clean status before committing is the contract: it means the working tree matches what would be applied to a fresh machine.

## Linux notes

- `private_Library/` is darwin-only — the dotfiles ignore it on Linux via `.chezmoiignore`.
- `run_onchange_install-packages-darwin.sh.tmpl` only renders on darwin; the linux variant lives alongside it.
- Most other paths (`dot_zshrc`, `dot_config/`) work identically on both.

## Don'ts

- **Don't** edit Chezmoi-managed files directly in `~`. The plugin's source-only hook blocks this when active; even with the hook off, the rule stands.
- **Don't** run `chezmoi apply` without `chezmoi diff` first — you lose the chance to catch unrelated drift.
- **Don't** commit before `chezmoi status` is clean. Drift between source and destination at commit time is the most common source of "my dotfiles broke on the other machine."

## Related skills

- [[chezmoi-templates]] — when a file should be a `.tmpl`
- [[chezmoi-data]] — when the change belongs in `.chezmoidata/` instead
- [[chezmoi-scripts]] — when you're editing a `run_onchange_*` or `run_once_*`
- [[package-management]] — when the change is "install a new tool"
