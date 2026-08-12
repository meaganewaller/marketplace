# Bun

Bun runtime, package management, testing, bundling, and standalone executables — verified against the Bun CLI, not recalled.

## Installation

```bash
/plugin install bun@meaganewaller-marketplace
```

## Components

### Commands

(None yet)

### Skills

- **bun-runtime**: Bun guidance across all four of its roles — runtime, package manager, bundler, and test runner. Loads detailed references on demand.

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## Usage

The `bun-runtime` skill triggers on Bun work: setting up a project, fixing an install, writing tests, compiling a binary, resolving a `bun.lock` conflict, or auditing dependencies.

### Quick Reference

The full Node-to-Bun mapping (16 rows, covering the runtime, package manager, bundler, and built-in APIs) lives in the skill itself, at `skills/bun-runtime/SKILL.md` — kept in one place so the two cannot drift.

### Reference Topics

Loaded only when relevant:

- **package-management**: `bun install`, the text-based `bun.lock`, workspaces, catalogs, migration, linker strategies
- **security**: `bun audit`, blocked lifecycle scripts, `minimumReleaseAge`, `bun patch`
- **testing**: `bun:test`, verified CLI flags, coverage thresholds, CI sharding, mocking
- **building**: `bun build`, cross-compilation, standalone executables
- **builtin-apis**: `Bun.serve` routes, `Bun.file`, `bun:sqlite`, `Bun.sql`, `Bun.redis`, `Bun.Glob`
- **shell**: `Bun.$` tagged templates, escaping guarantees, `Bun.spawn`
- **resolution**: export conditions, path aliases, import attributes, TypeScript types
- **bunx**: running packages, `--bun` semantics, caching

### Scripts

- **`scripts/bun-project-audit.sh`** — reports Bun version, lockfile format and whether it needs migrating, workspace layout, config files, and blocked lifecycle scripts.

```bash
plugins/bun/skills/bun-runtime/scripts/bun-project-audit.sh [project-dir]
```

## Accuracy

Bun's CLI surface is large and changes quickly, which makes it easy to state flags and config keys that sound right but do not exist. Every command, flag, and config key in this plugin was executed against Bun 1.3.14 rather than recalled. The skill records the specific things that are commonly invented — `bun test --grep`, `[test] include`/`exclude`, `[resolve]` in `bunfig.toml` — so they do not get repeated.

Two silent-failure traps documented here are worth calling out, because both look like they work:

- `coverageThreshold = { line = 0.9 }` never fails a build. The per-metric keys are plural (`lines`, `functions`, `statements`); the singular form is parsed and ignored.
- `Bun.build` throws an `AggregateError` on failure, so checking `result.success` without passing `throw: false` is dead code.

Installing Bun follows this repository's mise policy:

```bash
mise use -g bun@latest
```

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
