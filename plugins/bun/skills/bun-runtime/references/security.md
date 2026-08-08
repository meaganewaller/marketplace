# Dependency Security

Bun ships supply-chain tooling directly in the CLI. All commands verified against Bun 1.3.14.

## Auditing

```bash
bun audit                          # check installed packages against advisories
bun audit --json                   # machine-readable
bun audit --audit-level=high       # only high and critical
bun audit --ignore CVE-2024-12345  # suppress a specific advisory
```

`bun audit` exits non-zero when advisories are found at or above the level, so it works directly as a CI gate:

```yaml
- run: bun install --frozen-lockfile
- run: bun audit --audit-level=high
```

### Third-party scanners

`bun pm scan` is **not** a built-in scanner. It delegates to a pluggable scanner package and errors with `no security scanner configured` until one is registered:

```toml
# bunfig.toml
[install.security]
scanner = "<scanner-package>"
```

The scanner is an npm package exporting a scanner object; Bun then consults it during `bun install` as well. Use `bun audit` for the built-in advisory check.

## Blocking Freshly Published Packages

Compromised releases are usually caught within hours. Refusing very new versions removes most of that window:

```bash
bun install --minimum-release-age=86400    # nothing published in the last 24h
```

```toml
# bunfig.toml
[install]
minimumReleaseAge = 86400
```

This is one of the highest-leverage settings for a project that installs on every CI run. Pair it with `--frozen-lockfile` so CI installs a tree that was already vetted locally.

## Lifecycle Scripts and Trusted Dependencies

Bun does **not** run `postinstall` scripts for dependencies by default. This blocks the most common install-time attack, and it is a real behavioral difference from npm — a package that "works with npm but not Bun" is often a blocked lifecycle script.

Bun says so during install, which is the signal to look for:

```text
1 package installed [2.00ms]
Blocked 1 postinstall. Run `bun pm untrusted` for details.
```

```bash
bun pm untrusted            # list deps whose scripts were blocked
bun pm trust <pkg>          # allow one, adding it to trustedDependencies
bun pm trust --all          # allow every blocked dep (review first)
bun pm default-trusted      # Bun's built-in allowlist
```

Trust is recorded in `package.json`, so it is reviewable:

```json
{
  "trustedDependencies": ["esbuild", "sharp"]
}
```

Grant trust to a named package after checking what its script does. Avoid `--all` in anything automated.

To block scripts entirely, including for trusted packages:

```bash
bun install --ignore-scripts
```

## Patching a Dependency

Fix a vulnerable or broken dependency in place without forking or waiting on upstream:

```bash
bun patch <pkg>             # prepare an editable copy in node_modules
# edit node_modules/<pkg>/...
bun patch --commit node_modules/<pkg>
```

Bun writes a patch file and records it under `patchedDependencies` in `package.json`, then reapplies it on every install. Commit the patch file. Treat patches as temporary: track the upstream fix and remove the patch when it lands.

## Verifying Package Integrity

```bash
bun pm hash                 # hash of the current lockfile
bun pm hash-print           # hash recorded inside the lockfile
```

A mismatch means the lockfile was modified after it was written — worth investigating before installing. (The same hash doubles as a CI cache key; see `package-management.md`.)

## Private Registries

Keep credentials in environment variables, never in committed config. Bun expands `$NPM_TOKEN` in `bunfig.toml` at read time, so the file stays safe to commit — see the `[install.scopes]` example in `package-management.md`.

## Checklist for a Security-Sensitive Project

- [ ] `bun.lock` committed and reviewed in diffs
- [ ] CI uses `bun install --frozen-lockfile`
- [ ] `bun audit --audit-level=high` gates the pipeline
- [ ] `minimumReleaseAge` set in `bunfig.toml`
- [ ] `trustedDependencies` is short and each entry justified
- [ ] Registry tokens come from environment variables
- [ ] `patchedDependencies` entries tracked against upstream fixes
