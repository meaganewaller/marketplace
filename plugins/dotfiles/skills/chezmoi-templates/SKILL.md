---
name: chezmoi-templates
description: Writing and debugging Chezmoi .tmpl files using Go text/template — lookPath, stat, joinPath, OS branching, the .chezmoi namespace, and template data from .chezmoidata. Triggers on "chezmoi template", ".tmpl", "Go template", "lookPath", "promptStringOnce", ".chezmoi.os", "template render error", "conditional dotfile content", "branch by OS".
---

# Chezmoi templates

`.tmpl` files are rendered with Go `text/template` before being written to disk. They're how the same source tree produces different output per machine, OS, or user preference.

## When to use a template vs a static file

| Situation | Template? |
| --- | --- |
| Content differs by OS, hostname, or user choice | Yes |
| Content depends on whether a tool is installed | Yes |
| Content embeds a secret reference (1Password, etc.) | Yes — keeps the secret out of the source tree |
| Content is static across all machines | No — keep it a plain file |

A template costs you readability and one more layer of indirection. Reach for it only when you need the branching.

## Naming

Append `.tmpl`:

- `home/dot_zshrc` → static
- `home/dot_zshrc.tmpl` → rendered

Chezmoi strips `.tmpl` from the destination path: `home/dot_zshrc.tmpl` → `~/.zshrc`.

## The `.chezmoi` namespace

Always available inside templates:

- `.chezmoi.os` — `darwin`, `linux`, `windows`
- `.chezmoi.arch` — `amd64`, `arm64`
- `.chezmoi.hostname` — short hostname
- `.chezmoi.homeDir` — usually `$HOME`
- `.chezmoi.workingTree` — repo root on disk
- `.chezmoi.username` — current user

```gotmpl
{{- if eq .chezmoi.os "darwin" }}
alias ls='gls --color=auto'
{{- else }}
alias ls='ls --color=auto'
{{- end }}
```

## Template data from `.chezmoidata/`

YAML/TOML files under `home/.chezmoidata/` are loaded into the root data namespace by filename:

- `home/.chezmoidata/aliases.yaml` → `.aliases`
- `home/.chezmoidata/packages.yaml` → `.packages`

```gotmpl
{{- range .aliases.replacements }}
{{- if lookPath .tool }}
alias {{ .replaces }}='{{ .tool }}'
{{- end }}
{{- end }}
```

For new data files see the [[chezmoi-data]] skill.

## User-prompted variables

For per-machine values (git name/email, work-vs-personal profile), the dotfiles use `.chezmoi.toml.tmpl` with `promptStringOnce` / `promptBoolOnce`. These are prompted on `chezmoi init` and stored in `~/.config/chezmoi/chezmoi.toml`, then exposed as `.data.<name>`:

```gotmpl
{{- $gitName := promptStringOnce . "git.name" "Git user.name" -}}

[data.git]
name = {{ $gitName | quote }}
```

CI bypasses the prompt by reading env vars instead — see `.chezmoi.toml.tmpl` for the pattern.

## Common functions

| Function | Use |
| --- | --- |
| `lookPath "tool"` | Truthy if `tool` is on PATH. Use to gate `eval "$(tool init)"` lines. |
| `stat "/path"` | Truthy if path exists. Use for plugin files installed by externals. |
| `joinPath .chezmoi.homeDir ".config" "thing"` | Cross-platform path joining. |
| `env "VAR"` | Read an environment variable (rendered at `chezmoi apply` time). |
| `hasKey . "key"` | Conditionally read map keys without a render error. |
| `quote` / `squote` | Quote a string safely for shell/config. |
| `default <fallback>` | `{{ .maybe \| default "fallback" }}` |

## Whitespace control

`{{-` and `-}}` strip surrounding whitespace. Use them to keep rendered output clean:

```gotmpl
{{- if lookPath "zoxide" }}
eval "$(zoxide init zsh)"
{{- end }}
```

Without the dashes, you'd get blank lines where the conditional was.

## Testing template output

```bash
# Render a single template to stdout without writing
chezmoi execute-template < home/dot_zshrc.tmpl

# Render with a specific data file
chezmoi execute-template --init < home/dot_zshrc.tmpl

# Show what chezmoi would apply (rendered) without writing
chezmoi apply -nv ~/.zshrc
```

## Common errors

| Error | Likely cause |
| --- | --- |
| `map has no entry for key "X"` | Missing key in `.chezmoidata/`. Use `hasKey` to guard, or add the key. |
| `executing "X" at <Y>: <nil>` | Template referenced an undefined variable. Check `.chezmoi.toml` data section. |
| Blank lines / missing output | Forgot `{{-` `-}}` whitespace control. |
| Wrong content on one machine | Hostname/OS branch missing a case. Check `.chezmoi.hostname` / `.chezmoi.os`. |

## When to use a script instead

If the "template" is mostly conditional logic with little static content, prefer a `run_onchange_*` script ([[chezmoi-scripts]]) that produces the file. Templates shine for declarative content; scripts shine for procedural setup.
