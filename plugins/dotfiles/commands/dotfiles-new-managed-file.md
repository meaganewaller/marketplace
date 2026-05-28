---
description: Add a new file to the dotfiles source tree with the correct dot_ / dot_config / private_ prefix and optional .tmpl suffix
---

# /dotfiles-new-managed-file

Scaffolds a new managed file under `home/`. Picks the right prefix based on the destination, asks whether it needs templating, and (if so) leaves a starter template body.

## Steps

1. **Resolve repo path** via the **dotfiles-config** skill.

2. **Ask the user** with `AskUserQuestion`:

   - **What's the destination path?** Free text — e.g. `~/.config/foo/bar.toml`, `~/.zshrc`, `~/.ssh/extra_config`.
   - **Should it be a template?** (`.tmpl` suffix)
     - Yes — content branches by OS / hostname / installed tools / user preferences
     - No — static content, same on every machine
   - **Sensitive?** (use `private_` prefix)
     - Yes — secrets, machine-local, or anything that shouldn't be in plain text in the repo
     - No — public config

3. **Compute the source path:**

   | Destination | Source |
   | --- | --- |
   | `~/.foo` | `home/dot_foo` |
   | `~/.config/foo/bar` | `home/dot_config/foo/bar` |
   | `~/.ssh/foo` | `home/private_dot_ssh/foo` |
   | `~/Library/...` (darwin) | `home/private_Library/...` |

   Append `.tmpl` if templated. Adjust the leading directory to `private_*` if sensitive.

4. **Create the file** with a minimal starter:

   - **Non-templated:** empty file with a comment header noting the destination.
   - **Templated:** scaffold with one example `{{ if eq .chezmoi.os "darwin" }}` block to seed the pattern.

5. **Tell the user** what was created, what the rendered destination will be, and the next step:

```bash
chezmoi diff <destination>     # preview
chezmoi apply <destination>    # apply
```

## Don'ts

- Don't write secret values into the new file — even if `private_*`. Use `promptStringOnce` in `.chezmoi.toml.tmpl` (see [[chezmoi-templates]]) or a 1Password reference via the `credentials` alias pattern.
- Don't add binary content directly. Chezmoi supports binary, but it's easier to manage via externals ([[chezmoi-externals]]).
- Don't pick `.tmpl` "just in case." Static is simpler — add templating only when the content actually needs to differ.

## Linux notes

- `private_Library/` is darwin-only and ignored on Linux via `.chezmoiignore` — don't suggest this prefix on Linux.
- `home/dot_config/` works identically on both platforms.
