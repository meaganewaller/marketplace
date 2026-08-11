---
name: bun-runtime
description: This skill should be used when the user asks to "set up a Bun project", "run tests with bun test", "fix a bun install error", "migrate from npm/yarn/pnpm to Bun", "compile a standalone executable", "bundle with bun build", "write a shell script with Bun.$", "resolve a bun.lock conflict", "resolve a path alias in Bun", "run a package with bunx", "audit dependencies for vulnerabilities", or mentions bun, bunx, bun.lock, bunfig.toml, bun:test, bun:sqlite, Bun.serve, Bun.$, tsconfig paths, or import attributes.
---

# Bun Runtime Guidance

Bun is a JavaScript runtime, package manager, bundler, and test runner in one binary — all four roles below, with emphasis on the details that are easy to get wrong from memory.

Commands and config keys here were executed against **Bun 1.3.14** specifically — not the 1.3 line as a whole. Some postdate 1.2, so confirm availability against the installed binary when a project pins an older version.

## Verify Before Asserting

Bun ships breaking-ish changes quickly, and its CLI surface is large enough that plausible-sounding flags and config keys frequently do not exist. Confirm anything uncertain against the installed binary rather than recalling it:

```bash
bun --version              # know which version's behavior applies
bun <subcommand> --help    # authoritative flag list
bun pm --help              # package management subcommands
```

Capture version, lockfile format, workspace layout, and config state for a project in one pass:

```bash
scripts/bun-project-audit.sh [project-dir]   # defaults to the current directory
```

## Commonly Hallucinated — These Do Not Exist

Each row below was executed against Bun 1.3.14. These read as reasonable, so they get invented often. Never emit them:

| Invented | Actual |
| ---------- | -------- |
| `[test] include` / `exclude` in bunfig.toml | Silently ignored — discovery is by filename only |
| `[resolve]` section in bunfig.toml | No such section; use package.json `overrides` |
| `bun pm ls --peer` | Flag is ignored; nothing reports missing peer deps |
| `import x from "pkg" with { type: "module" }` | Attributes are `json`, `text`, `toml`, `sqlite`, `file`, `macro` |
| `coverageThreshold = { line = ... }` | Plural keys — `lines`, `functions`, `statements` |

Two more that are real but misremembered rather than invented: `bun-types` exists,
but `@types/bun` is the package to install (it wraps `bun-types`); and `bunx --bun`
forces the Bun runtime instead of Node, it does not control local-vs-cached binary
ordering.

Test discovery is filename-based: `.test.`, `_test_`, `.spec.`, or `_spec_`.

## The Lockfile Changed in 1.2

The single most common stale assumption: since Bun 1.2 the default lockfile is **`bun.lock`**, a text-based JSONC file, not the binary `bun.lockb`. Conflict resolution, migration, and workspace catalogs are in `references/package-management.md`.

## Quick Reference

| Instead of | Use |
| ------------ | ----- |
| `node file.ts` | `bun file.ts` |
| `npx package` | `bunx package` |
| `npm install` | `bun install` |
| `npm ci` | `bun install --frozen-lockfile` |
| `npm run script` | `bun run script` |
| `jest` / `vitest` | `bun test` |
| `npm audit` | `bun audit` |
| `npm ls why` | `bun why <pkg>` |
| `webpack` / `esbuild` | `bun build` |
| `pkg` / `nexe` | `bun build --compile` |
| `dotenv` | Built-in (auto-loads `.env`) |
| `execa` | `Bun.$` |
| `better-sqlite3` | `bun:sqlite` |
| `pg` / `postgres.js` | `Bun.sql` |
| `ioredis` | `Bun.redis` |
| `ws` | Built-in `WebSocket` |

## References

Load the one matching the task:

| Task | Reference |
| ------ | ----------- |
| Installing, lockfiles, workspaces, catalogs, migration, linker | `references/package-management.md` |
| Vulnerability audits, blocked lifecycle scripts, patching deps | `references/security.md` |
| Writing and running tests, coverage thresholds, CI sharding | `references/testing.md` |
| Bundling, cross-compilation, standalone executables | `references/building.md` |
| `Bun.serve` routes, `Bun.file`, `bun:sqlite`, `Bun.sql`, `Bun.redis` | `references/builtin-apis.md` |
| Shell scripting with `Bun.$`, `Bun.spawn` | `references/shell.md` |
| Module resolution, path aliases, import attributes, types | `references/resolution.md` |
| Running packages with bunx | `references/bunx.md` |

## Running Code

```bash
bun run src/index.ts        # execute TypeScript directly, no build step
bun --watch src/index.ts    # restart process on change
bun --hot src/server.ts     # reload in place, preserving state (servers)
bun -e 'console.log(1)'     # evaluate a string
bun -p 'process.version'    # evaluate and print the result
```

Prefer `--hot` for long-lived servers, since it keeps existing connections and module state; prefer `--watch` for scripts and CLIs that should start clean.

Environment variables load from `.env` automatically — never add `dotenv`:

```bash
bun run script.ts                    # .env, .env.local, .env.<NODE_ENV> auto-load
bun --env-file=.env.staging app.ts   # override the file explicitly
```

`.env.local` takes precedence over `.env` — a frequent source of "my variable is being ignored".

## Project Setup

```bash
bun init -y         # accept defaults
bun init --react    # React scaffold (also --react=tailwind, --react=shadcn)
bun create <template>
```

`bun init -y` writes `package.json`, `tsconfig.json`, `index.ts`, `README.md`, `.gitignore`, `CLAUDE.md`, and `.cursor/`, then installs. Note that `bun init --help` claims it also creates `bunfig.toml`; it does not — a reminder that observed behavior outranks help text.

Install Bun itself with mise, so the version is pinned alongside the project's other tools:

```bash
mise use -g bun@latest      # global default
mise use bun@1.3.14         # pin for a project (writes mise.toml)
```

## Built-in APIs

Reach for these before adding a dependency:

```typescript
const text = await Bun.file("input.txt").text();
await Bun.write("output.txt", "content");

const branch = await Bun.$`git branch --show-current`.text();

import { Database } from "bun:sqlite";
const db = new Database("app.sqlite");

Bun.serve({
  routes: { "/health": () => new Response("ok") },
});
```

`Bun.serve` takes a `routes` object with path parameters and per-method handlers — it is a router, not just a `fetch` handler. See `references/builtin-apis.md`.

## Profiling

Bun emits markdown-formatted profiles intended for reading by language models, which is usually more useful than the binary formats:

```bash
bun --cpu-prof-md script.ts      # CPU profile as grep-friendly markdown
bun --heap-prof-md script.ts     # heap snapshot as markdown
bun build --metafile-md=graph.md ./src/index.ts
```

## Common Mistakes

| Mistake | Correction |
| --------- | ------------ |
| Describing `bun.lockb` as the current format | `bun.lock` (text) is the default since 1.2 |
| Adding `dotenv`, `execa`, `ws`, `better-sqlite3` | All have built-in equivalents |
| `bun install --production` to skip dev deps in CI | Works, but `--omit=dev` is the composable form |
| Assuming `bun test` needs a config file to find tests | Discovery is filename-based and needs no config |
| Using `npm ci` semantics without `--frozen-lockfile` | Bun only refuses lockfile changes when asked |
| Recommending global installs for CLIs | `bunx <pkg>` runs without installing |
