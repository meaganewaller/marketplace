# PR Title (Conventional Commits)

Referenced from [pr/SKILL.md](../SKILL.md) step 4. For type selection and subject grammar, see [conventional-commits.md](../../../rules/conventional-commits.md) — this file covers what's specific to PR titles: scope discovery, why the format matters here, and the commands for updating a title after the fact.

**CRITICAL:** PR titles must follow conventional commit format. This drives release-please version automation and ensures consistent git history when using squash-and-merge — the PR title becomes the squash commit message.

## Subject length

Under 50 characters. (Commit messages have a separate, slightly different budget — see `commit.md` — because a PR title also has to read well in the GitHub PR list UI, which truncates more aggressively than `git log --oneline`.)

## Scope

Optional component identifier. Keeps history organized:

```text
feat(auth): add OAuth support
fix(api): handle null response
docs(readme): update install steps
refactor(core): simplify error handling
```

**Discover repo scopes** from merged PR history:

```bash
gh pr list --state merged -L 30 --json title | jq -r '.[].title' | grep -oE '\([^)]+\)' | sort | uniq -c | sort -rn
```

Or from commit history:

```bash
git log --format='%s' -n 50 | grep -oE '\([^)]+\)' | sort | uniq -c | sort -rn
```

## Quick reference

| Scenario | Template |
|----------|----------|
| Feature | `feat(<scope>): add <what>` |
| Bug fix | `fix(<scope>): resolve <what>` |
| Performance | `perf(<scope>): optimize <what>` |
| Docs | `docs(<scope>): update <what>` |
| Refactor | `refactor(<scope>): simplify <what>` |
| Deps | `build(deps): bump <pkg> to <ver>` |
| Breaking | `feat(<scope>)!: change <what>` |

## Why this matters

Conventional-commit PR titles ensure:

1. **Accurate automation** — release-please reads PR titles to determine version bumps
2. **Clean git history** — squash-and-merge uses the PR title as the commit message
3. **Searchable commits** — the type prefix makes filtering easy
4. **CHANGELOG accuracy** — commits are grouped by type in generated changelogs

## Commands

| Context | Command |
|---------|---------|
| Get commits since base | `git log origin/main..HEAD --format='%s' -n 10` |
| Changed directories (scope hint) | `git diff origin/main..HEAD --name-only \| xargs dirname \| sort -u` |
| Update an existing PR's title | `gh pr edit N --title "new title"` |
| Discover repo scopes | `gh pr list --state merged -L 30 --json title \| jq -r '.[].title' \| grep -oE '\([^)]+\)' \| sort \| uniq` |
