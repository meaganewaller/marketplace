---
description: Run mise doctor, interpret the output, and suggest fixes for any issues found
---

# mise Doctor

Run `mise doctor` to diagnose the mise setup in the current environment, then interpret the results and suggest actionable fixes.

## Instructions

1. Run `mise doctor` and capture the output.

2. Parse the output for any warnings or errors. Common categories to look for:
   - **Activation** — mise not activated in shell (`eval "$(mise activate zsh)"` missing from rc file)
   - **Trust** — `mise.toml` not trusted (run `mise trust`)
   - **Missing tools** — Tools in `mise.toml` not yet installed (run `mise install`)
   - **Shim issues** — PATH ordering problems causing wrong tool version to be used
   - **Plugin issues** — Outdated or broken backend/plugin (run `mise plugins update`)
   - **Config errors** — Syntax errors in `mise.toml`

3. For each issue found:
   - Explain what the issue means in plain language
   - Provide the exact command to fix it
   - Note whether the fix is safe to run automatically or requires user review

4. If `mise doctor` reports no issues, confirm everything looks healthy and show the active tool versions with `mise current`.

5. If activation is missing from the shell rc file, show the exact line to add:
   - zsh: `eval "$(mise activate zsh)"` in `~/.zshrc`
   - bash: `eval "$(mise activate bash)"` in `~/.bashrc`
   - fish: `mise activate fish | source` in `~/.config/fish/config.fish`

6. Ask the user if they want fixes applied automatically for any safe, non-destructive fixes.

## Common Fixes

```bash
# Trust the current project's mise.toml
mise trust

# Install all tools in mise.toml
mise install

# Update all plugins
mise plugins update

# Reshim all tools (fix PATH/shim issues)
mise reshim

# Check current active versions after fixes
mise current
```
