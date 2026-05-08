# mise

mise dev environment management — tool versions, environment variables, tasks, and project configuration.

## Installation

```bash
/plugin install mise@meaganewaller-marketplace
```

## Components

### Commands

| Command | Description |
|---|---|
| `/mise-init` | Scaffold `mise.toml` for the current project, detecting existing tool config files |
| `/mise-doctor` | Run `mise doctor`, interpret the output, and suggest fixes |
| `/mise-run` | List available mise tasks and run one interactively |

### Skills

| Skill | Triggers on |
|---|---|
| `mise-config` | Questions about `mise.toml` structure, config hierarchy, env vars, idiomatic version files |
| `mise-tasks` | Writing or running mise tasks, task arguments, dependencies, `mise-tasks/` scripts |
| `mise-tools` | Installing tools, version pinning, upgrading, backends (npm, cargo, pip, ubi, asdf) |

### Agents

| Agent | Description |
|---|---|
| `mise-setup` | Autonomous end-to-end mise setup — detects tools, generates config, installs everything |

### Hooks

| Hook | Behavior |
|---|---|
| `SessionStart` | Silent when healthy; nudges if `mise.toml` is missing from a code project; surfaces `mise doctor` issues |

## Usage

### Set up mise in a new project

Run the command for a guided walkthrough:

```text
/mise-init
```

Or spawn the agent for fully autonomous setup:

```text
Set up mise for this project
```

### Run tasks

```text
/mise-run
```

Lists all tasks from `mise.toml` and lets you pick one. Pass a task name directly to skip the list:

```text
/mise-run test
```

### Diagnose issues

```text
/mise-doctor
```

### Add a tool

Ask naturally — the `mise-tools` skill activates automatically:

```text
Add node 22 to this project with mise
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
