# Package Management

Covers `bun install`, the lockfile, workspaces, and migration. All commands verified against Bun 1.3.14.

## The Lockfile: `bun.lock`

Since Bun 1.2, `bun install` writes **`bun.lock`** — a text-based JSONC file (trailing commas, unquoted-safe formatting). The binary `bun.lockb` is legacy.

```jsonc
{
  "lockfileVersion": 1,
  "configVersion": 1,
  "workspaces": {
    "": { "name": "my-app", "dependencies": { "hono": "^4.6.0" } }
  },
  "packages": { /* resolved tree with integrity hashes */ }
}
```

Commit `bun.lock`. Because it is text:

- Merge conflicts are readable and hand-resolvable. Regenerating is a fallback, not the first move.
- Dependency changes are reviewable in a diff.
- Do not mark it binary in `.gitattributes`.

### Migrating from `bun.lockb`

```bash
bun install --save-text-lockfile   # emit bun.lock from the existing tree
git rm --cached bun.lockb && rm bun.lockb
```

### Resolving conflicts

Prefer a real resolution, then reconcile:

```bash
git checkout --theirs bun.lock   # or --ours, or hand-edit the conflicted block
bun install                      # reconciles the tree and normalizes the file
```

Verify the result rather than trusting it:

```bash
bun install --frozen-lockfile    # fails if the lockfile still disagrees with package.json
```

## Installing

```bash
bun install                      # install from package.json + lockfile
bun install --frozen-lockfile    # CI: fail if the lockfile would change
bun install --lockfile-only      # resolve and write the lockfile, skip node_modules
bun install --dry-run            # show what would change
bun add hono                     # add a dependency
bun add -d @types/bun            # devDependency
bun add -E hono                  # exact version, no ^ range
bun remove hono
```

### Selecting dependency groups

```bash
bun install --omit=dev           # skip devDependencies
bun install --omit=optional
bun install --omit=dev --omit=peer
bun install --production         # older equivalent of --omit=dev
```

`--omit` composes; `--production` does not. Prefer `--omit` for anything beyond the simple case.

### Linker strategy

```bash
bun install --linker=hoisted     # npm-style flat node_modules (default)
bun install --linker=isolated    # pnpm-style, strict — undeclared deps fail
```

Use `isolated` to catch phantom dependencies: code importing a package it never declared.

## Inspecting

```bash
bun list                  # dependency tree from the lockfile
bun list --all            # full transitive tree
bun why <pkg>             # explain why a package is installed
bun why "@types/*" --depth 2
bun why lodash --top      # only the top-level chain
bun outdated              # versions behind latest
bun info <pkg>            # registry metadata
bun pm hash               # lockfile hash, useful as a CI cache key
```

`bun pm ls` still works as an alias for `bun list`. Bun has no command that reports *missing* peer dependencies.

## Updating

```bash
bun update                # respect semver ranges in package.json
bun update --latest       # ignore ranges, go to newest
bun update -i             # interactively pick packages
bun update -r             # across all workspaces
bun update hono           # single package
```

## Workspaces

```json
{
  "name": "root",
  "private": true,
  "workspaces": ["packages/*"]
}
```

```bash
bun install                              # installs every workspace
bun install --filter './packages/api'    # one workspace
bun run --filter '*' build               # run a script in all workspaces
```

### Catalogs

Declare a version once at the root and reference it from every package — the fix for version drift across a monorepo:

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "catalog": { "hono": "^4.6.0" },
    "catalogs": { "testing": { "@types/bun": "^1.3.0" } }
  }
}
```

```json
{
  "dependencies": { "hono": "catalog:" },
  "devDependencies": { "@types/bun": "catalog:testing" }
}
```

`catalog:` uses the default catalog; `catalog:<name>` selects a named one. Bumping the root entry updates every consumer.

## Overrides

Force a transitive dependency to a specific version in `package.json` — **not** in `bunfig.toml`, which has no resolution section:

```json
{
  "overrides": { "semver": "7.6.3" }
}
```

Bun also reads yarn-style `resolutions`.

## Migrating from Another Package Manager

Bun reads the existing lockfile and preserves resolved versions:

```bash
bun install                # auto-detects package-lock.json / yarn.lock / pnpm-lock.yaml
bun pm migrate             # convert the lockfile without installing
```

Then remove the old lockfile in the same commit so the two cannot drift.

## Configuration

`bunfig.toml`:

```toml
[install]
exact = true                              # save without ^ ranges
registry = "https://registry.npmjs.org"
linker = "isolated"

[install.scopes]
"@mycompany" = { url = "https://npm.mycompany.com", token = "$NPM_TOKEN" }
```

Bun also reads `.npmrc` for registry and auth settings.

## CI

```yaml
- uses: oven-sh/setup-bun@v2
  with: { bun-version: latest }
- run: bun install --frozen-lockfile
- run: bun test
```

Use `bun pm hash` as a cache key so the cache invalidates exactly when the resolved tree changes.

## Troubleshooting

| Symptom | Action |
| --------- | -------- |
| Lockfile disagrees with package.json | `bun install` locally, commit the result |
| CI fails only on install | Confirm `--frozen-lockfile` and that `bun.lock` is committed |
| Import works locally, fails in CI | Undeclared dependency — reproduce with `--linker=isolated` |
| Integrity or corruption errors | `bun pm cache rm && rm -rf node_modules && bun install` |
| Need a clean resolve | `rm bun.lock node_modules -rf && bun install` (last resort) |
