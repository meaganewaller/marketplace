# Module Resolution

Bun's module resolution is Node.js compatible with enhancements.

## Resolution Order

1. Built-in modules (`bun:*`, `node:*`)
2. Absolute paths
3. Relative paths (`./`, `../`)
4. `node_modules` lookup
5. `package.json` exports/imports

## Built-in Modules

```typescript
// Bun-specific
import { Database } from "bun:sqlite";
import { $ } from "bun";

// Node.js compatible (with bun: or node: prefix)
import { readFile } from "node:fs/promises";
import { join } from "node:path";
```

## Package.json Exports

Bun respects the `exports` field:

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

The `"bun"` condition takes priority when running under Bun.

## Path Aliases (tsconfig.json)

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
// Now works
import { Button } from "@components/Button";
```

## bunfig.toml Configuration

```toml
[install]
# Use exact versions
exact = true

[install.scopes]
# Private registry for scoped packages
"@mycompany" = "https://npm.mycompany.com"

[resolve]
# Override module resolution
"lodash" = "lodash-es"
```

## Troubleshooting

### Module Not Found

```bash
# Check if package is installed
bun pm ls | grep <package>

# Reinstall
bun install

# Check resolution
bun --print "require.resolve('<package>')"
```

### TypeScript Types Missing

```bash
# Install types package
bun add -d @types/<package>

# Or for Bun's own types
bun add -d bun-types
```

### ESM vs CJS Issues

```typescript
// Force ESM import
import pkg from "package" with { type: "module" };

// Dynamic import for CJS
const pkg = await import("package");
```

### Workspace Resolution

```bash
# Link workspace packages
bun link

# Check workspace deps
bun pm ls --all
```

### Peer Dependencies

```bash
# Install peer deps automatically
bun install

# Check for missing peers
bun pm ls --peer
```

## Node.js Compatibility

Most Node.js resolution works, but note:

- Bun prefers `"bun"` export condition
- Bun can import TypeScript directly
- Some Node.js APIs have Bun-optimized alternatives
