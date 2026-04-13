# Writing Cues

This guide covers how to create cues that inject guidance when triggers match.

## Quick Start

```txt
# 1. Create cue directory
mkdir -p cues/my-cue

# 2. Create cue file
touch cues/my-cue/cue.md
```

## Cue Location

```
~/.claude/cues/        # Global cues
$PROJECT/.claude/cues/ # Project-local cues (overrides globals)
```

Project-local cues take precedence when names match.

## Cue Format

```md
---
# Trigger matching (regex) - at least one required
pattern: commit|push|amend           # Match user prompts
commands: git\s+(commit|push)        # Match bash commands
files: \.env$|\.env\.local$          # Match file paths

# Scope control
scope: agent                         # agent | subagent | agent, subagent

# Semantic matching (fallback when regex misses)
description: Git commit workflow and version control
vocabulary: commit push amend rebase merge changelog

# Dynamic content (optional)
macro: prepend                       # prepend | append
---

# Cue Title

- Guidance directive 1
- Guidance directive 2
- Keep directives actionable and concise
```

## Trigger Types

### Pattern (User Prompts)

```yaml
pattern: commit|push|amend
```

Matches against the user's prompt text. Use regex.

### Commands (Bash)

```yaml
commands: git\s+(commit|push|rebase)
```

Matches against bash commands before execution.

### Files (Write/Edit)

```yaml
files: \.env$|\.env\.local$|config/.*\.yml$
```

Matches against file paths being written or edited.

## Matching Priority

1. Regex match - pattern:, commands:, or files: fields
2. Vocabulary match - Any word in vocabulary: appears in query
3. Semantic match - Gzip NCD similarity to description: (threshold: 0.65)

Semantic matching enables intent-based triggers when exact regex fails.

## Scope Filtering

| Scope | Fires For | Use When |
| ---   | ---       | ---      |
| `agent` | Main agent only | Default; most cues |
| `subagent` | Spawned subagents only | Subagent-specific guidance |
| `agent, subagent` | Both contexts | Universal guidance |

### Subagent Injection

Subagent cues use a two-phase stash pattern:

1. `cue-task-stash` (PreToolUse: Task) - Stashes matching cues
2. `cue-inject-subagent.sh` (SubagentStart) - Injects stashed cues

This ensures subagents receive relevant guidance even though they start in a fresh context.

## Macros

Add dynamic content with `macro.sh`:

```md
---
macro: prepend # or append
---
```

```sh
# cues/my-cue/macro.sh
#!/usr/bin/env bash
set -euo pipefail

# Access cue directory and session
echo "CUE_DIR: $CUE_DIR"
echo "SESSION_ID: $SESSION_ID"

# Output dynamic content
if [[ -f "package.json" ]]; then
  echo "**Node project detected** - use npm/yarn commands"
fi
```

Make executable: `chmod +x cues/my-cue/macro.sh`

## Once-Per-Session Gating

Each cue fires at most once per session to avoid repetition.

- Markers stored in `/tmp/.claude-cue-{session}-{cue-name}`
- `clear-cue-markers.sh` resets on SessionStart
- `show-cue.sh` handles marker checking automatically

## Best Practices

### Content

- Keep directives **actionable** - tell the agent what to do
- Be **concise** - cues inject into limited context
- Use **imperative** mood - "Do X" not "You should do X"
- Avoid **duplicating** information available elsewhere

### Triggers

- Use **specific** regex to avoid false positives
- Add **vocabulary** for intent-based fallback
- Write **description** for semantic matching
- Test with `match-cues.sh`:

```sh
bash ~/.claude/plugins/marketplaces/meaganewaller/plugins/cues/hooks/scripts/match-cues.sh prompt "your test prompt"
```

### Scope

- Default to `agent` unless subagents need the guidance
- Use `agent, subagent` for universal rules (secrets, commits)

## Testing

```sh
# Test matching
bash ~/.claude/plugins/marketplaces/meaganewaller/plugins/cues/hooks/scripts/match-cues.sh prompt "commit my changes"
bash ~/.claude/plugins/marketplaces/meaganewaller/plugins/cues/hooks/scripts/match-cues.sh bash "git push origin main"
bash ~/.claude/plugins/marketplaces/meaganewaller/plugins/cues/hooks/scripts/match-cues.sh file ".env.local"

# Test cue output (with marker gating)
bash ~/.claude/plugins/marketplaces/meaganewaller/plugins/cues/hooks/scripts/show-cue.sh ~/.claude/cues/commit test-session
```

## Examples

### Simple Cue

```md
---
pattern: docker|container
scope: agent
description: Docker and containerization workflows
vocabulary: docker container dockerfile compose kubernetes k8s
---

# Docker Cue

- Use multi-stage builds to reduce image size
- Never store secrets in Dockerfiles; use build args or secrets
- Pin base image versions for reproducibility
```

### Cue with Macro

```md
---
files: Gemfile$|\.gemspec$
scope: agent
macro: prepend
---

# Ruby Dependencies

- Run `bundle install` after Gemfile changes
- Use pessimistic version constraints (`~>`)
```

```sh
# cues/ruby-deps/macro.sh
#!/usr/bin/env bash
if [[ -f "Gemfile.lock" ]]; then
  ruby_version=$(grep -A1 "RUBY VERSION" Gemfile.lock | tail -1 | tr -d ' ')
  echo "**Ruby version**: $ruby_version"
fi
```

## Related Documentation

- [Cues README](../plugins/cues/README.md)