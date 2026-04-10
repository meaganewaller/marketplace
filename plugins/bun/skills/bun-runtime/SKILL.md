---
name: bun-runtime
description: Provides Bun runtime guidance including bunx, shell scripting, lockfile management, resolution, and testing patterns. Use when working with Bun projects or needing Bun-specific advice.
---

# Bun Runtime Guidance

This skill provides comprehensive guidance for working with the Bun runtime.

## When to Use This Skill

Use this skill when:

- Setting up or configuring Bun projects
- Running scripts with bunx
- Managing dependencies and lockfiles
- Writing shell scripts that use Bun
- Writing tests with bun:test
- Troubleshooting module resolution issues

## Core Principles

1. **Bun over Node**: Always prefer Bun equivalents over Node.js tooling
2. **Built-in APIs**: Use Bun's built-in APIs instead of npm packages
3. **mise for installation**: Use `mise install bun` to manage Bun versions

## Quick Reference

| Instead of | Use |
| ------------ | ----- |
| `node file.ts` | `bun file.ts` |
| `npx package` | `bunx package` |
| `npm install` | `bun install` |
| `npm run script` | `bun run script` |
| `jest` / `vitest` | `bun test` |
| `dotenv` | Built-in (auto-loads .env) |

## Progressive Disclosure

For detailed guidance on specific topics, load the appropriate reference:

- **bunx usage** → Read `references/bunx.md`
- **Lockfile management** → Read `references/lockfile.md`
- **Module resolution** → Read `references/resolution.md`
- **Shell scripting** → Read `references/shell.md`
- **Testing patterns** → Read `references/testing.md`

## Installation with mise

```bash
# Install latest Bun
mise install bun

# Install specific version
mise install bun@1.1.0

# Set global default
mise use -g bun@latest

# Project-specific version (creates .mise.toml)
mise use bun@1.1.0
```

## Built-in APIs to Prefer

```typescript
// File I/O
const file = Bun.file("path/to/file");
const text = await file.text();
await Bun.write("output.txt", "content");

// Shell commands
const result = await Bun.$`ls -la`;

// HTTP server
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello!");
  },
});

// SQLite
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite");

// Testing
import { test, expect } from "bun:test";
```

## Common Patterns

### Running TypeScript Directly

```bash
# No compilation step needed
bun run src/index.ts

# With watch mode
bun --watch src/index.ts

# With hot reload (for servers)
bun --hot src/server.ts
```

### Environment Variables

Bun auto-loads `.env` files:

```bash
# .env is loaded automatically
bun run script.ts

# Specify different env file
bun --env-file=.env.local run script.ts
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "test": "bun test",
    "build": "bun build src/index.ts --outdir dist"
  }
}
```

## Troubleshooting

| Issue | Solution |
| ------- | ---------- |
| Module not found | Check `references/resolution.md` |
| Lockfile conflicts | Check `references/lockfile.md` |
| bunx package fails | Check `references/bunx.md` |
| Tests not running | Check `references/testing.md` |
