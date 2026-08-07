# Git Branch Naming Conventions

Not currently referenced by any skill in this plugin — none of `commit`, `pr`, `split-pr`, `babysit`, or `issue` create branches themselves. Kept here, ready for a future branch-creation skill to point to, and usable ad hoc when a user asks "what should I name this branch."

Consistent branch naming improves traceability, enables automation, and makes repository history easier to navigate.

## Format

```text
{type}/{issue}-{short-description}
```

| Component | Format | Required | Example |
|-----------|--------|----------|---------|
| `type` | Lowercase prefix | Yes | `feat`, `fix` |
| `issue` | Issue number, no `#` | If issue exists | `123` |
| `description` | kebab-case, 2-5 words | Yes | `user-authentication` |

### Examples

```bash
# With issue number (preferred when issue exists)
feat/123-oauth-login
fix/456-null-pointer-crash
chore/789-update-dependencies
docs/101-api-reference

# Without issue number (when no issue exists)
feat/oauth-integration
fix/memory-leak-cleanup
chore/update-eslint-config
refactor/auth-service-split
```

## Branch types

The type prefix should match the [conventional-commits.md](conventional-commits.md) type vocabulary — same `feat`/`fix`/`docs`/etc., so a branch's prefix predicts the commit type it'll produce. Two additions are branch-lifecycle concepts, not commit types, and have no `conventional-commits.md` equivalent:

| Type | Purpose | Conventional commit it produces |
|------|---------|---------------------|
| `feat/` | New features, capabilities | `feat:` |
| `fix/` | Bug fixes | `fix:` |
| `chore/` | Maintenance, deps, config | `chore:` |
| `docs/` | Documentation only | `docs:` |
| `refactor/` | Code restructuring, no behavior change | `refactor:` |
| `test/` | Adding/updating tests | `test:` |
| `ci/` | CI/CD pipeline changes | `ci:` |
| `hotfix/` *(branch-only)* | Emergency production fixes | `fix:` (with urgency) |
| `release/` *(branch-only)* | Release preparation | `chore:` or `release:` |

## Creating branches

```bash
# With issue number
git switch -c feat/123-user-authentication

# Without issue number
git switch -c fix/login-timeout-handling

# From specific base
git switch -c feat/456-payment-api main
git switch -c hotfix/security-patch production
```

### Validation pattern

```text
^(feat|fix|chore|docs|refactor|test|ci|hotfix|release)/([0-9]+-)?[a-z0-9]+(-[a-z0-9]+)*$
```

Valid: `feat/123-user-auth`, `fix/memory-leak`, `chore/update-deps`

Invalid: `feature/user-auth` (use `feat`, not `feature`) · `fix/UserAuth` (kebab-case, not PascalCase) · `my-branch` (missing type prefix) · `feat/fix_bug` (hyphens, not underscores)

## Issue linking

| Scenario | Include issue? | Example |
|----------|----------------|---------|
| Work tracked in GitHub Issues | Yes | `feat/123-add-oauth` |
| Work tracked in external system (Jira, Linear) | Optional | `feat/PROJ-456-oauth` or `feat/oauth` |
| Exploratory/spike work | No | `spike/auth-approaches` |
| Quick fix without issue | No | `fix/typo-readme` |
| Dependabot/automated PRs | No | `chore/bump-lodash` |

For external ticket systems, use the ticket ID in place of the issue number: `feat/PROJ-123-user-dashboard`, `fix/LINEAR-456-api-timeout`.

## Description guidelines

**Good:** action + target (`add-oauth-login`), component + change (`auth-service-refactor`), bug + context (`null-pointer-user-save`).

**Avoid:** too vague (`fix/bug` → `fix/123-login-validation`), meaningless (`feat/new-feature` → `feat/user-dashboard`), not descriptive (`feat/john-working-on-stuff` → `feat/456-payment-flow`), redundant (`fix/issue-123` → `fix/123-timeout-error`), too long (`feat/add-new-user-authentication-system-with-oauth` → `feat/oauth-authentication`).

**Length:** minimum 2 words after type/issue, maximum 5 words / ~50 characters total. Sweet spot is 3-4 words.

## Special patterns

```bash
# Release branches
release/1.0.0
release/2.1.0-beta
release/v3.0.0-rc1

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-data-loss

# Long-running branches (date suffix for multi-week efforts)
feat/123-major-refactor-2026q1
epic/new-billing-system
```

## Commands

| Action | Command |
|--------|---------|
| Create branch | `git switch -c feat/123-description` |
| List by type | `git branch --list 'feat/*'` |
| Delete local | `git branch -d feat/123-description` |
| Delete remote | `git push origin --delete feat/123-description` |
| Rename | `git branch -m old-name new-name` |
