# bunx Reference

bunx is Bun's equivalent to npx - it runs packages without installing them globally.

## Basic Usage

```bash
# Run a package
bunx cowsay "Hello!"

# Run a specific version
bunx cowsay@1.5.0 "Hello!"

# Run from a specific registry
bunx --registry=https://registry.npmjs.org cowsay "Hello!"
```

## Common Patterns

### Running CLI Tools

```bash
# TypeScript compiler
bunx tsc --init

# ESLint
bunx eslint src/

# Prettier
bunx prettier --write .

# Create React App equivalent
bunx create-vite my-app

# Database migrations
bunx prisma migrate dev
```

### Running Local Binaries

```bash
# Prefer local node_modules/.bin first
bunx --bun eslint .

# Force using Bun runtime for the package
bunx --bun tsx script.ts
```

## Differences from npx

| Feature | bunx | npx |
| --------- | ------ | ----- |
| Speed | Faster (native) | Slower |
| Caching | Aggressive | Less aggressive |
| Bun runtime | `--bun` flag | N/A |
| Auto-install | Yes | Yes |

## Cache Management

```bash
# bunx caches packages in ~/.bun/install/cache
# Clear cache if needed:
rm -rf ~/.bun/install/cache

# Or use bun's cache command
bun pm cache rm
```

## Troubleshooting

### Package Not Found

```bash
# Ensure package name is correct
bunx <exact-package-name>

# Try with explicit registry
bunx --registry=https://registry.npmjs.org <package>
```

### Version Conflicts

```bash
# Pin to specific version
bunx <package>@<version>

# Clear cache and retry
bun pm cache rm && bunx <package>
```

### Binary Not Executable

Some packages specify their binary in `package.json` bin field. If bunx can't find it:

```bash
# Check what binaries are available
bunx <package> --help

# Or run the main export directly
bun -e "import pkg from '<package>'; pkg()"
```
