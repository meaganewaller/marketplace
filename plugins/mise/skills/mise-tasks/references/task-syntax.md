# mise Task Syntax Reference

Full reference for task configuration in `mise.toml` and `mise-tasks/` scripts.

## Inline Task Fields (mise.toml)

```toml
[tasks.example]
run = "command to run"           # Required: command string or array
description = "What this does"   # Shown in `mise tasks`
depends = ["other-task"]         # Tasks to run first
env = { KEY = "value" }          # Task-scoped env vars
dir = "./subdir"                 # Working directory (relative to project root)
sources = ["src/**/*.ts"]        # Inputs for caching (reruns only if changed)
outputs = ["dist/**/*.js"]       # Outputs for caching
shell = "bash -c"                # Override shell (default: sh -c)
hide = false                     # Hide from `mise tasks` listing
```

## Multi-line run

```toml
[tasks.ci]
run = [
  "bun install --frozen-lockfile",
  "bun run lint",
  "bun run test",
]
```

Each string in the array runs as a separate command; if one fails, the task stops.

## Task-Scoped Environment

```toml
[tasks.test]
run = "bun test"
env = { NODE_ENV = "test", LOG_LEVEL = "silent" }
```

## Argument Passthrough

Use `{{args}}` to forward CLI arguments to the command:

```toml
[tasks.test]
run = "bun test {{args}}"
```

Usage: `mise run test -- src/auth.test.ts --watch`

## Task Dependencies

```toml
[tasks.build]
run = "bun build src/index.ts --outdir dist"

[tasks.test]
run = "bun test"
depends = ["build"]   # build runs first, then test

[tasks.deploy]
run = "./scripts/deploy.sh"
depends = ["build", "test"]  # both run before deploy
```

## File-Based Tasks (mise-tasks/)

Create executable scripts in `mise-tasks/` at the project root. mise discovers them automatically.

### Shell example

```bash
#!/usr/bin/env bash
#MISE description="Run tests with optional watch mode"
#USAGE flag "-w --watch" "Enable watch mode"
#USAGE arg "[pattern]" "Test file pattern (optional)"

set -euo pipefail

PATTERN="${usage_pattern:-}"
WATCH="${usage_watch:-false}"

CMD="bun test"
[[ -n "$PATTERN" ]] && CMD="$CMD $PATTERN"
[[ "$WATCH" == "true" ]] && CMD="$CMD --watch"

exec $CMD
```

### usage Directives

```bash
#MISE description="Task description shown in mise tasks"
#USAGE flag "-v --verbose" "Enable verbose output"
#USAGE flag "-e --env <env>" "Target environment" default="development"
#USAGE arg "<name>" "Required positional argument"
#USAGE arg "[output]" "Optional positional argument"
```

Access parsed values as `$usage_<flag-name>` (hyphens become underscores):

- `--verbose` → `$usage_verbose` (true/false)
- `--env staging` → `$usage_env` (staging)
- positional `<name>` → `$usage_name`

### Python example

```python
#!/usr/bin/env python3
# mise description: Generate API documentation
import subprocess
import sys

subprocess.run(["python", "-m", "pdoc", "src/"], check=True)
```

## Listing Tasks

```bash
# Show all tasks with descriptions
mise tasks

# Show tasks without header
mise tasks --no-header

# Show tasks in JSON format
mise tasks --json
```

## Caching with sources/outputs

```toml
[tasks.build]
run = "bun build src/index.ts --outdir dist"
sources = ["src/**/*.ts", "package.json"]
outputs = ["dist/**/*.js"]
# Skips if sources haven't changed since last successful run
```
