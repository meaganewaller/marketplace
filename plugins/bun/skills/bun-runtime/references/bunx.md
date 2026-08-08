# bunx

`bunx` executes a package's CLI binary, installing it into a global shared cache if it is not already present. It is Bun's `npx`. `bun x` is the same command.

## Basics

```bash
bunx prettier --write .
bunx cowsay@1.5.0 "pinned version"
bunx prisma migrate dev
```

Resolution order: a binary already in the project's `node_modules/.bin` wins; otherwise the package is fetched into the shared cache and run from there. Local project versions therefore take precedence automatically — no flag required.

## Flags

Only these exist:

| Flag | Purpose |
| ------ | --------- |
| `--bun` | Run the binary with the Bun runtime instead of Node.js |
| `-p, --package <pkg>` | Install `<pkg>` when the binary name differs from the package name |
| `--no-install` | Fail rather than fetch a missing package |
| `--verbose` | Verbose installation output |
| `--silent` | Suppress installation output |

There is **no** `--registry` flag. Point bunx at a different registry through `bunfig.toml` or `.npmrc`:

```toml
# bunfig.toml
[install]
registry = "https://npm.mycompany.com"
```

### `--bun`

Many CLIs ship a `#!/usr/bin/env node` shebang and would otherwise run under Node even when invoked through bunx. `--bun` overrides that and executes them with Bun:

```bash
bunx --bun vite dev
```

This is what makes a Node-targeted tool run on Bun's runtime. It does **not** control whether local or cached binaries are preferred — that ordering is automatic.

Use it when a tool should pick up Bun's TypeScript handling or speed; drop it when a tool depends on Node internals and misbehaves under Bun.

### `-p` for mismatched names

```bash
bunx -p @angular/cli ng new my-app
bunx -p typescript tsc --init
```

Required whenever the executable is not named after its package — otherwise bunx looks for a package matching the binary name and fails.

## Locking Down CI

```bash
bunx --no-install eslint .
```

`--no-install` refuses to fetch anything not already installed, so a typo or a compromised registry cannot silently pull a package mid-pipeline. Prefer declaring tools as devDependencies and running them via `bun run`, keeping bunx for one-off and scaffolding commands.

## Cache

Packages land in Bun's shared install cache:

```bash
bun pm cache            # print the cache path
bun pm cache rm         # clear it
```

## Troubleshooting

| Symptom | Cause and fix |
| --------- | --------------- |
| `package not found` | Binary name differs from package name — use `-p <package>` |
| Old version keeps running | A local `node_modules/.bin` copy takes precedence; check it, or pin with `pkg@version` |
| Tool fails only under Bun | Drop `--bun` so it runs on Node |
| Wrong registry | Set `[install] registry` in `bunfig.toml`; there is no CLI flag |
| Need reproducibility | Pin `pkg@version`, or add it as a devDependency and use `bun run` |
