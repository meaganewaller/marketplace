# Module Resolution

Bun's resolver is Node-compatible with additions. Verified against Bun 1.3.14.

## Resolution Order

1. Built-in modules (`bun:*`, `node:*`)
2. Absolute and relative paths
3. `tsconfig.json` `paths` aliases
4. `package.json` `imports` (subpath imports, `#`-prefixed)
5. `node_modules` lookup, honoring `exports`

Extensions and index files resolve without being written out, and TypeScript is loaded directly — no build step, no `.js` extension rewriting.

## Export Conditions

Bun applies the `"bun"` condition before `"import"`/`"require"`, so a package can ship source to Bun and compiled output elsewhere:

```json
{
  "exports": {
    ".": {
      "bun": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": "./src/utils.ts"
  }
}
```

Add custom conditions with `bun --conditions=dev src/index.ts`.

Once `exports` is present, only the listed subpaths are importable. A previously working deep import breaking after a dependency upgrade usually means `exports` was added upstream.

## Path Aliases

Bun reads `paths` from `tsconfig.json` directly — no runtime resolver plugin needed:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

```typescript
import { Button } from "@/components/Button";   // verified working
```

For aliases that should also work outside Bun, prefer `imports` in `package.json`:

```json
{ "imports": { "#config": "./src/config.ts" } }
```

## Import Attributes

Bun supports these attribute types — verified:

```typescript
import data from "./d.json" with { type: "json" };
import conf from "./d.toml" with { type: "toml" };
import text from "./d.txt"  with { type: "text" };
import path from "./img.png" with { type: "file" };   // resolved path as a string
import db   from "./app.db" with { type: "sqlite" };
```

There is **no** `type: "module"` attribute. Writing it does not force ESM — Bun ignores the unknown value and imports normally, so it is a silent no-op rather than an error. To load a CommonJS module dynamically, use `await import()`.

## TypeScript Types

```bash
bun add -d @types/bun          # correct
```

Use `@types/bun`, not `bun-types`. `@types/bun` is the DefinitelyTyped entry point and depends on `bun-types`; installing `bun-types` directly gets the internals without the wrapper `bun init` sets up.

```json
{
  "compilerOptions": {
    "types": ["bun"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```

## Overrides

`bunfig.toml` has **no** `[resolve]` section. Adding one does nothing — the override is silently ignored. Pin transitive versions with `overrides` in `package.json`; see `package-management.md`.

## Auto-install

Bun can resolve packages absent from `node_modules`:

```bash
bun --install=fallback script.ts   # fetch only what is missing
bun -i script.ts                   # shorthand
bun --no-install script.ts         # fail instead of fetching
```

Convenient for single-file scripts; keep it off for applications so a missing dependency fails loudly instead of being fetched implicitly.

## Inspecting Resolution

```bash
bun -e 'console.log(Bun.resolveSync("hono", process.cwd()))'
bun why <pkg>                 # why a package is in the tree
bun list --all                # full resolved tree
```

`Bun.resolveSync(specifier, parentDir)` reports exactly what Bun would load — the fastest way to settle a "which copy is being imported" question.

## Troubleshooting

| Symptom | Cause and fix |
| --------- | --------------- |
| `Cannot find module` for an installed package | `exports` blocks the subpath — check the package's `exports` map |
| Alias works in the editor, not at runtime | `paths` needs `baseUrl`; confirm with `Bun.resolveSync` |
| Works locally, fails in CI | Undeclared dependency; reproduce with `bun install --linker=isolated` |
| Two copies of a package | `bun why <pkg>`, then pin with `overrides` |
| Types missing for a built-in | `bun add -d @types/bun` and set `"types": ["bun"]` |
| Node package uses `__dirname` in ESM | `import.meta.dir` is Bun's equivalent |

## Node Compatibility

Bun implements most of `node:*`. Differences worth knowing:

- The `"bun"` export condition wins, so a package may run different source under Bun than under Node.
- TypeScript is executed directly; type errors do not stop execution, since types are stripped without checking. Run `tsc --noEmit` for type checking.
- Native addons (`.node`) have partial support — verify rather than assume.
