---
name: dotfiles-config
description: Reads and writes plugin-local settings for the dotfiles plugin — primarily the path to the Chezmoi-managed dotfiles repository. Other skills in this plugin route through this one to resolve the working tree. Triggers on "dotfiles repo path", "where is my dotfiles", "configure dotfiles plugin", "set dotfiles location", "dotfiles plugin settings", or any time a sibling skill needs the repo path.
---

# dotfiles plugin settings

This skill resolves the working tree that other skills in the plugin operate on. Most of the time you'll call it as a sub-step from another skill, not directly.

## Where settings live

Settings are stored as YAML frontmatter in a markdown file:

- **Project-scoped:** `.claude/dotfiles.local.md` in the current repo
- **Global:** `~/.claude/dotfiles.local.md`

Project-scoped wins. The body of the file is freeform notes; only the frontmatter is read.

```markdown
---
repo_path: ~/src/github.com/meaganewaller/dotfiles
platform: darwin
---

# dotfiles plugin settings

Notes about local overrides go here.
```

## Resolution order

1. **Project file** — `.claude/dotfiles.local.md`'s `repo_path`
2. **Global file** — `~/.claude/dotfiles.local.md`'s `repo_path`
3. **Convention check** — `~/src/github.com/meaganewaller/dotfiles` if it exists *and* contains `.chezmoiroot` or a top-level `home/` directory
4. **Chezmoi default** — `chezmoi source-path` if the binary is on PATH
5. **Prompt** — Use `AskUserQuestion` to ask, then write the answer to the global settings file

Always expand `~` to `$HOME` before using the path. Verify the resolved path exists and looks like a Chezmoi source tree (has `home/` or `.chezmoiroot`) before returning it.

## Reading settings

```bash
# Project-scoped
if [[ -f .claude/dotfiles.local.md ]]; then
  awk '/^---$/{flag=!flag; next} flag' .claude/dotfiles.local.md
fi

# Global
if [[ -f "$HOME/.claude/dotfiles.local.md" ]]; then
  awk '/^---$/{flag=!flag; next} flag' "$HOME/.claude/dotfiles.local.md"
fi
```

Parse with `yq` if available, otherwise grep for the key: `grep '^repo_path:' file | awk '{print $2}'`.

## Writing settings (first-time prompt)

When no setting exists and the convention check fails, ask the user:

> Where is your Chezmoi-managed dotfiles repo? (Common: `~/src/github.com/meaganewaller/dotfiles`)

Then write to **global** settings by default — the user only needs to answer once across all projects. If the user is clearly working with a different dotfiles repo per-project (rare), write to project settings instead.

```markdown
---
repo_path: <expanded absolute path>
platform: <darwin or linux>
---

# dotfiles plugin settings

Auto-written by the dotfiles-config skill.
```

`platform` defaults to the output of `uname -s | tr '[:upper:]' '[:lower:]'`. The skills use it to lead with macOS or Linux variants.

## Verifying the resolved path

Before returning, sanity-check:

```bash
[[ -d "$path" ]] || die "Resolved repo_path does not exist: $path"
[[ -f "$path/.chezmoiroot" || -d "$path/home" ]] || die "Path doesn't look like a Chezmoi source tree: $path"
```

If verification fails, re-prompt instead of silently using a broken path.

## Returning the value to the caller

Caller skills should expect a single absolute path string with `~` expanded. They should not have to do their own validation — if you return a value, it has already been verified.
