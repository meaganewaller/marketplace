---
name: chezmoi-data
description: Adding and editing YAML/TOML data files under home/.chezmoidata/ that templates consume — aliases, packages, themes, ghostty config, tmux plugins, authorized_keys. Triggers on ".chezmoidata", "aliases.yaml", "packages.yaml", "themes.yaml", "add a brew package", "add an alias to dotfiles", "template data", "update homebrew bundle".
---

# Chezmoi data files

`home/.chezmoidata/*.yaml` (or `.toml`) are structured inputs for templates. Filename becomes the top-level data key: `aliases.yaml` → `.aliases`.

## Existing data files

| File | Consumed by | Shape |
| --- | --- | --- |
| `aliases.yaml` | `dot_zshrc.tmpl` | `replacements[]`, `custom[]`, `fallbacks[]`, `credentials[]` |
| `packages.yaml` | `run_onchange_install-packages-darwin.sh.tmpl`, `…linux.sh.tmpl` | `darwin.brews`, `darwin.casks`, `linux.apt`, etc. |
| `themes.yaml` | theme system / starship overlay | catalog of theme definitions |
| `ghostty.yaml` | ghostty config templates | terminal config blocks |
| `tmux-plugins.yaml` | tmux config templates | plugin list |
| `authorized_keys.yaml` | `private_dot_ssh/authorized_keys.tmpl` | SSH pubkeys |

## Adding to an existing file

The two highest-traffic cases:

### Adding a Homebrew package

```yaml
# home/.chezmoidata/packages.yaml
darwin:
  brews:
    - git
    - jq
    - your-new-tool   # add here, alphabetically
  casks:
    - ghostty
    - your-new-cask
```

The `run_onchange_install-packages-darwin.sh.tmpl` script will re-run on next `chezmoi apply` because its rendered content changed. Verify with `chezmoi diff` — the script should appear in the diff with a new hash.

**Caveat:** Homebrew is for system packages with no mise equivalent. CLIs and runtimes belong in `home/dot_config/mise/config.toml`, not here. See [[package-management]].

### Adding a shell alias

`aliases.yaml` has four sections, each with different rendering rules:

| Section | Renders if |
| --- | --- |
| `replacements` | The named tool is on PATH (`alias <replaces>='<tool>'`) |
| `custom` | The named tool is on PATH (`alias <replaces>='<command>'`) |
| `fallbacks` | The first tool in `chain` that's on PATH is used |
| `credentials` | Both `op` (1Password CLI) and the named tool are on PATH; secret injected on every invocation |

```yaml
custom:
  - replaces: ll
    tool: eza
    command: eza -la --git
```

After editing, `chezmoi diff` should show a change in `dot_zshrc` (because the template consumes `aliases.yaml` and re-renders).

## Adding a new data file

1. **Create** `home/.chezmoidata/<name>.yaml` (or `.toml`).
2. **Reference it** from a template as `.{{ name }}` (filename without extension).
3. **`chezmoi apply`** — no init required; Chezmoi picks up new data files automatically.

Keep top-level keys consistent: lowercase, snake_case for keys with multiple words. The dotfiles convention is YAML for data and TOML for config that mirrors a tool's native config format.

## What does NOT belong in `.chezmoidata/`

- **Secrets** — use `promptStringOnce` in `.chezmoi.toml.tmpl` or 1Password references via the `credentials` alias pattern. `.chezmoidata/` is public.
- **Machine-specific values** — those go in `.chezmoi.toml.tmpl` `[data]` (prompted per-machine, stored in `~/.config/chezmoi/chezmoi.toml`).
- **One-off content** that only one template uses — inline it in the template instead of adding indirection.

## Verifying after changes

```bash
chezmoi diff              # shows all templates that re-rendered
chezmoi apply -nv         # dry-run with explanations
chezmoi status            # should be clean after apply
```

If a template that should have re-rendered didn't, double-check the data file name matches the namespace your template uses.

## Linux notes

- `packages.yaml` has separate `darwin` and `linux` sections; the install scripts branch on `.chezmoi.os`.
- `authorized_keys.yaml` is platform-independent.
- macOS-specific packages (e.g. casks) live only under `darwin:`.

## Related

- [[chezmoi-templates]] — for the template side of the read
- [[package-management]] — for which manifest the package actually belongs in
