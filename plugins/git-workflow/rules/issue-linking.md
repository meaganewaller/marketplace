# Linking Issues, Commits, and PRs

Referenced by [issue](../skills/issue/SKILL.md), [commit](../skills/commit/SKILL.md), and [pr](../skills/pr/SKILL.md) — whichever skill is producing text that should reference an issue. For matching a diff to a candidate issue in the first place, see [issue-detection.md](issue-detection.md).

Pick the mechanism that matches the relationship — GitHub surfaces each one differently, and only the native APIs trigger "Blocked" badges on project boards.

## Relationship types

| Relationship | How to record | Why |
|--------------|---------------|-----|
| Hard dependency (must happen before) | Native `dependencies/blocked_by` API — `issues/{N}/dependencies/blocked_by` | Sidebar "Relationships" entry + Blocked badge on boards |
| Composition (part-of scope) | Sub-issue API — `repos/{owner}/{repo}/issues/{parent}/sub_issues` | Progress bar on parent, tracked separately from dependencies |
| Soft reference ("related to") | Plain markdown `Related to #789` in the body | Cross-link only; no lifecycle coupling |
| Auto-close on merge | `Fixes #N` / `Closes #N` footer in a commit or PR body | Closes the issue when the PR merges |

**Do not write `Blocks #123` or `Blocked by #456` as plain text in issue or PR bodies.** Those strings used to be GitHub's workaround for missing dependency APIs, but they are no longer parsed into anything — no badge, no sidebar entry, nothing. Use the native dependency API instead so the relationship actually shows up on project boards.

## Closing keywords (auto-close on merge)

Use when the commit or PR **fully resolves** the issue:

| Keyword | Use case |
|---------|----------|
| `Fixes #N` | Bug fixes — something was broken, now it works |
| `Closes #N` | Feature completion — requested feature is implemented |
| `Resolves #N` | General resolution — issue is addressed |

## Reference keywords (link without closing)

Use when the commit or PR **relates to** but doesn't fully resolve the issue:

| Keyword | Use case |
|---------|----------|
| `Refs #N` | Partial progress toward the issue |
| `Related to #N` | Tangentially related changes |
| `See #N` | Context or discussion reference |
| `Part of #N` | One of multiple commits/PRs for an issue |

## Decision tree

```text
Is this the FINAL fix for the issue?
├─ YES → Is it a bug fix?
│        ├─ YES → Use "Fixes #N"
│        └─ NO → Use "Closes #N"
└─ NO → Does it make progress on the issue?
         ├─ YES → Use "Refs #N"
         └─ NO → Use "Related to #N" or omit
```

## Multiple and cross-repo issues

```bash
# Close all that are fully resolved
Fixes #123, fixes #124, fixes #125

# Or mix closing and reference keywords
Fixes #123
Refs #124, #125

# Reference an issue in another repository (monorepo / multi-repo)
Fixes owner/other-repo#42
```

## Verify before referencing

Don't reference an issue that's already closed unless the intent is to reopen it, and check whether the issue already has a linked PR in progress before assuming this one is the first.
