# Bun

Bun runtime patterns, bunx, shell scripting, lockfile management, and testing guidance.

## Installation

```bash
/plugin install bun@meaganewaller-marketplace
```

## Components

### Commands

(None yet)

### Skills

- **bun-runtime**: Provides comprehensive Bun runtime guidance including:
  - bunx usage patterns
  - Lockfile management
  - Module resolution
  - Shell scripting with Bun.$
  - Testing with bun:test

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## Usage

The `bun-runtime` skill is automatically triggered when working with Bun projects or asking for Bun-specific guidance.

### Quick Reference

| Instead of         | Use              |
| ------------------ | ---------------- |
| `node file.ts`     | `bun file.ts`    |
| `npx package`      | `bunx package`   |
| `npm install`      | `bun install`    |
| `npm run script`   | `bun run script` |
| `jest` / `vitest`  | `bun test`       |

### Installing Bun with mise

```bash
mise install bun
mise use -g bun@latest
```

### Reference Topics

The skill includes detailed references for:

- **bunx**: Running packages without global installation
- **lockfile**: Managing bun.lockb, migrations, CI/CD
- **resolution**: Module resolution, path aliases, troubleshooting
- **shell**: Bun.$ for shell scripting
- **testing**: bun:test patterns, mocking, assertions

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
