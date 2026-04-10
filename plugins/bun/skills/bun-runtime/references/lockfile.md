# Lockfile Management

Bun uses `bun.lockb` - a binary lockfile format that's faster to read/write than JSON.

## Lockfile Basics

```bash
# Generate/update lockfile
bun install

# Install from lockfile exactly (CI)
bun install --frozen-lockfile

# Update all dependencies
bun update

# Update specific package
bun update lodash
```

## Lockfile Format

- `bun.lockb` is binary (not human-readable)
- Much faster to parse than package-lock.json or yarn.lock
- Contains exact versions and integrity hashes

### Viewing Lockfile Contents

```bash
# Print lockfile as YAML (human-readable)
bun bun.lockb

# Or use bun's built-in
bun pm ls
```

## Migration from Other Package Managers

### From npm

```bash
# Remove old lockfile
rm package-lock.json

# Generate new Bun lockfile
bun install
```

### From yarn

```bash
rm yarn.lock
bun install
```

### From pnpm

```bash
rm pnpm-lock.yaml
bun install
```

## CI/CD Best Practices

```yaml
# GitHub Actions example
- name: Install dependencies
  run: bun install --frozen-lockfile
```

**Key flags:**

- `--frozen-lockfile`: Fail if lockfile would change (use in CI)
- `--no-save`: Don't update package.json
- `--production`: Skip devDependencies

## Troubleshooting

### Lockfile Out of Sync

```bash
# Regenerate lockfile
rm bun.lockb
bun install
```

### Merge Conflicts

Since `bun.lockb` is binary, you can't manually resolve conflicts:

```bash
# Accept current and regenerate
git checkout --ours bun.lockb
bun install

# Or accept theirs and regenerate
git checkout --theirs bun.lockb
bun install
```

### Integrity Errors

```bash
# Clear cache and reinstall
bun pm cache rm
rm -rf node_modules bun.lockb
bun install
```

## Workspaces

For monorepos, Bun handles workspace lockfiles:

```json
// package.json
{
  "workspaces": ["packages/*"]
}
```

```bash
# Install all workspace dependencies
bun install

# Install in specific workspace
bun install --cwd packages/my-package
```

## Version Pinning

```bash
# Pin exact versions (no ^ or ~)
bun add lodash --exact

# Or configure in bunfig.toml
# [install]
# exact = true
```
