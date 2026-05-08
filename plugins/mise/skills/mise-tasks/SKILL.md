---
created: 2026-05-08
modified: 2026-05-08
reviewed: 2026-05-08
name: mise-tasks
description: |
  Writing and running mise tasks in mise.toml and the mise-tasks/ directory.
  Task arguments, dependencies, environment, and the usage tool for documentation
  and shell completions. Use when the user asks about defining tasks, running tasks
  with mise run, adding task arguments, task dependencies, or mise-tasks files.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit
---

# mise Tasks

Expert guidance for defining and running tasks with mise.

## Defining Tasks in mise.toml

Simple tasks as inline strings:

```toml
[tasks.test]
run = "bun test"
description = "Run the test suite"

[tasks.lint]
run = "bunx biome check ."
description = "Lint and format check"

[tasks.build]
run = "bun build src/index.ts --outdir dist"
description = "Build for production"
```

Multi-line tasks:

```toml
[tasks.ci]
run = [
  "bun install --frozen-lockfile",
  "bun run lint",
  "bun run test",
  "bun run build",
]
description = "Full CI pipeline"
```

## Task Dependencies

Run tasks before another task with `depends`:

```toml
[tasks.test]
run = "bun test"
depends = ["lint"]

[tasks.deploy]
run = "./scripts/deploy.sh"
depends = ["build", "test"]
description = "Build, test, then deploy"
```

## Task Arguments

Pass arguments through to the underlying command:

```toml
[tasks.test]
run = "bun test {{args}}"
description = "Run tests (pass file or pattern as arg)"
```

Usage: `mise run test -- src/auth.test.ts`

## File-Based Tasks (mise-tasks/)

For complex tasks, create standalone scripts in `mise-tasks/`:

```text
mise-tasks/
├── build        # Shell script, executable
├── test         # Shell script, executable
└── deploy       # Shell script, executable
```

Each file is a script (any language) made executable. mise automatically discovers them:

```bash
#!/usr/bin/env bash
# mise-tasks/test
set -euo pipefail

bun test "$@"
```

Make executable: `chmod +x mise-tasks/test`

## Running Tasks

```bash
# List all available tasks
mise tasks
mise tasks --no-header

# Run a task
mise run test
mise run build

# Pass arguments to a task
mise run test -- --watch
mise run test -- src/auth.test.ts

# Run with a specific working directory
mise run --cd ./packages/api test

# Run multiple tasks
mise run lint test build
```

## Task Environment

Tasks automatically inherit the full mise environment — all tool versions and env vars from `mise.toml` are available without shell activation:

```toml
[env]
NODE_ENV = "test"

[tasks.test]
run = "bun test"  # NODE_ENV=test is already set
```

## usage Tool Integration

Add documentation and shell completions to file-based tasks with the `usage` tool:

```bash
#!/usr/bin/env bash
#MISE description="Run tests for a specific package"
#USAGE flag "-w --watch" "Watch mode"
#USAGE arg "<package>" "Package name to test" required=true

set -euo pipefail

PACKAGE="${usage_package}"
WATCH="${usage_watch:-false}"

if [[ "$WATCH" == "true" ]]; then
  bun test "packages/$PACKAGE" --watch
else
  bun test "packages/$PACKAGE"
fi
```

See [Task Syntax Reference](references/task-syntax.md) for the full option set.

## Best Practices

- Define all project entrypoints as tasks so `mise tasks` serves as a project runbook
- Use descriptive `description` fields — they appear in `mise tasks` output
- Prefer `mise.toml` inline tasks for simple commands, `mise-tasks/` for scripts with logic
- Use `depends` to encode task order rather than chaining commands with `&&`
- Always use `set -euo pipefail` in shell-based mise-tasks scripts
