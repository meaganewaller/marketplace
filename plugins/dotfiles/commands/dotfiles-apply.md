---
description: Preview-then-apply dotfile changes — chezmoi diff, confirm, chezmoi apply, chezmoi status
---

# /dotfiles-apply

Walks the safe apply loop: never apply blindly, always preview first, validate after.

## Arguments

Optional: one or more destination paths to apply (e.g. `~/.zshrc ~/.config/mise/config.toml`). With no arguments, applies the full tree.

## Steps

1. **Resolve repo path** via the **dotfiles-config** skill.
2. **`cd` to the repo** and run `chezmoi diff [paths]`. Show the user the diff.
3. **Ask the user to confirm** with `AskUserQuestion` before applying. Options:
   - **Apply all** — `chezmoi apply [paths]`
   - **Apply selected paths only** — narrow further (re-ask which subset)
   - **Cancel** — do nothing
4. **Run the apply** if confirmed:

```bash
cd "<repo_path>"
chezmoi apply [paths]
```

1. **Validate** with `chezmoi status`. A clean status means the apply succeeded fully.

## Notes

- If the diff contains unrelated drift (something the user didn't expect), **stop and ask** before applying. Unexpected diffs usually mean an out-of-band edit in `~`, a template-data change, or a `run_onchange_*` script re-rendering — all worth understanding before committing them.
- For the macOS-specific scripts (`run_onchange_install-packages-darwin.sh.tmpl`), expect the script-hash to appear in the diff if data changed. That's normal — the rendered script content shifted.
- Use targeted paths when other unrelated drift exists. Full-tree apply is a "the diff looks clean" maneuver.
