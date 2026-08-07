# Conventional Commits Standards

Shared by [`/commit`](../skills/commit/SKILL.md) and [`/pr`](../skills/pr/SKILL.md) (via [pr-title.md](../skills/pr/reference/pr-title.md)). This is the canonical type table and subject-line grammar — the commit-message-specific rules (mood emoji, exact char limits, American-English pass) live in `/commit`; the PR-title-specific rules (scope discovery from merged PRs, release-please rationale) live in `skills/pr/reference/pr-title.md`.

## Format

```text
<type>(<scope>): <subject>
```

`<scope>` is optional. Append `!` before the colon for a breaking change (see below).

## Type selection

| Type | Use case | Version bump |
|------|----------|--------------|
| `feat` | New feature | Minor |
| `fix` | Bug fix | Patch |
| `perf` | Performance improvement | Patch |
| `refactor` | Code restructure (no behavior change) | None |
| `docs` | Documentation only | None |
| `test` | Tests | None |
| `style` | Formatting, whitespace, lint fixes (no logic change) | None |
| `build` | Build system or dependencies | None |
| `ci` | CI configuration | None |
| `chore` | Maintenance, everything else | None |

**Decision tree:** Feature → `feat` | Bug → `fix` | Performance → `perf` | Restructure with no behavior change → `refactor` | Docs → `docs` | Tests only → `test` | Formatting/lint only → `style` | Build/deps → `build` | CI config → `ci` | Everything else → `chore`

## Subject line

- **Imperative mood**: "add" not "adds" or "added"
- **Lowercase**: start with lowercase after the colon
- **No period**: don't end with punctuation
- **Concise**: the exact character budget depends on where the subject is used (a commit subject line and a PR title have different display contexts) — see the calling skill for the specific limit

**Examples:**

| ❌ Bad | ✅ Good |
|--------|---------|
| `Added login button` | `add login button` |
| `Fixes the bug.` | `fix null pointer in auth` |
| `Update` | `update dependencies` |
| `Resolved Performance Issues` | `improve query performance` |

## Breaking changes

Append `!` before the colon:

```text
feat(api)!: remove deprecated endpoints
fix!: require Node.js 18+
refactor(db)!: change schema format
```

Breaking changes trigger major version bumps.

## Reverts

```text
revert: feat(auth): add OAuth support
```
