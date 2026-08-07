---
name: split-pr
description: Analyzes the current diff and proposes how to split it into smaller, reviewable PRs, grouped by logical concern with a suggested creation order. Use when a changeset feels too large to review, the user says a PR is "too big" or "should be split up", or before opening a PR with many unrelated files changed.
allowed-tools:
    - Bash(git diff:*)
    - Bash(git log:*)
    - Bash(git symbolic-ref:*)
    - Bash(git rev-parse:*)
    - Bash(git check-attr:*)
---

# Split Large PR into Smaller Changes

## Purpose

Help developers break down large changesets into logical, reviewable pull requests. This skill analyzes the current diff and proposes a splitting strategy that keeps changes atomic and reviewable. It only reads and recommends — it never stages, commits, or pushes anything itself.

## Constraints

**Never use `git -C <path>`** — always run git commands from the current working directory. The `-C` flag rewrites the command in a way that doesn't match `allowed-tools` patterns, forcing unnecessary user approval.

## Instructions

### 1. Determine the Base Branch

Don't assume `main`. Resolve it in order of preference, falling back as needed:

```bash
BASE=$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null | sed 's#^[^/]*/##') \
  || BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's#^refs/remotes/origin/##') \
  || BASE=""
```

If both resolve to nothing (detached HEAD, no `origin`, no upstream tracking), ask the user which branch to diff against instead of guessing `main`.

### 2. Analyze Current Changes

Run these commands to understand the scope (substitute `$BASE` from step 1):

```bash
# Get detailed file statistics
git diff "${BASE}...HEAD" --stat

# List all changed files
git diff "${BASE}...HEAD" --name-only

# Show commit history for context
git log "${BASE}...HEAD" --oneline
```

**Exclude generated files.** The most reliable cross-language signal is git's own `linguist-generated` attribute (respected by GitHub, set via `.gitattributes`) — check that first rather than guessing extensions:

```bash
git diff "${BASE}...HEAD" --name-only | while read -r f; do
  git check-attr linguist-generated -- "$f" | grep -q 'linguist-generated: true' || echo "$f"
done > /tmp/split-pr-files.txt
```

If the repo has no `linguist-generated` markers, fall back to common conventions for that repo's ecosystem — `vendor/`, `node_modules/`, `dist/`, `build/`, `*.lock`, `*.min.*`, or a `docs/` tree — but confirm which apply by looking at what's actually in the diff rather than assuming one language's layout.

```bash
# Count non-generated files changed
wc -l < /tmp/split-pr-files.txt

# Lines changed, excluding generated files
git diff "${BASE}...HEAD" --stat -- $(tr '\n' ' ' < /tmp/split-pr-files.txt) | tail -1
```

### 3. Evaluate Size and Complexity

Assess whether the changes exceed recommended limits:

- **Target limits per PR**:
  - < 10 files changed (excluding tests, generated code, docs)
  - < 400 lines of code changed (excluding tests, generated code, docs)
  - Changes represent one logical unit of work

These are starting points, not hard rules — code review research generally finds reviewer defect-detection drops off past a few hundred changed lines and attention fades past a handful of files. Adjust for the team and the nature of the change.

If changes exceed these limits or mix multiple concerns, proceed to split analysis.

### 4. Identify Logical Groupings

Examine the changed files and identify natural boundaries:

- **By component/package**: Group changes by the directory or module they affect
- **By layer**: Separate model changes, business logic, API changes, CLI/UI changes
- **By concern**: Separate refactoring from new features, bug fixes from enhancements
- **By dependency**: Identify which changes depend on others

Use these commands to help (language-agnostic — group by path and extension rather than assuming a specific ecosystem's layout):

```bash
# Group non-generated changed files by top-level directory
cut -d'/' -f1-2 /tmp/split-pr-files.txt | sort | uniq -c

# Group by file extension, to spot mixed concerns (e.g. schema + implementation)
sed 's/.*\.//' /tmp/split-pr-files.txt | sort | uniq -c
```

Adapt the directory depth (`f1-2`) to how deep this repo's package/module structure actually goes — check `git diff --stat` output first rather than assuming.

### 5. Propose Split Strategy

Create a structured plan with multiple PRs:

For each proposed PR, specify:

- **PR Name**: Brief description (e.g., "Add base container interface")
- **Purpose**: What this PR accomplishes and why it's needed
- **Files included**: List of files that would be in this PR
- **Estimated size**: Approximate lines changed
- **Dependencies**: Which other proposed PRs this depends on (if any)
- **Test coverage**: What tests are included
- **Order**: Suggest the sequence for creating PRs (e.g., "Create this first")

### 6. Recommend Creation Order

Determine the optimal order for creating PRs:

1. **Foundation PRs first**: New interfaces, base types, shared utilities
2. **Refactoring PRs second**: Changes that use the new foundation
3. **Feature PRs last**: New functionality that builds on the foundation
4. **Independent PRs anytime**: Changes that don't depend on others

### 7. Present Action Plan

Provide a clear, actionable plan:

```markdown
## Proposed PR Split

### Summary
Currently [X] files changed with [Y] lines modified. Recommend splitting into [N] PRs:

### PR 1: [Name] (Create First)
**Purpose**: [What and why]
**Files**:
- path/to/file1
- path/to/file2
**Size**: ~100 LOC
**Dependencies**: None
**Tests**: Includes unit tests for new functionality

### PR 2: [Name] (After PR 1)
**Purpose**: [What and why]
**Files**:
- path/to/file3
**Size**: ~150 LOC
**Dependencies**: Requires PR 1 (uses new interface)
**Tests**: Integration tests

[... continue for each PR ...]

## Next Steps
1. Would you like me to help create PR 1 first?
2. Should I create a tracking issue for the overall work?
3. Any changes to this split strategy?
```

### 8. Hand Off to Execution

This skill only analyzes and proposes — it doesn't stage, commit, or push. If the user confirms a proposed PR:

1. Stage only that PR's listed files explicitly (`git add <file1> <file2> ...`) — never `git add -A`, since precise file selection is the entire point of the split.
2. Use the `commit` skill to craft the commit(s) for that group.
3. Use the `pr` skill once that group's commits are ready to open as a PR.
4. Repeat per PR in the recommended order from step 6, re-running `git diff "${BASE}...HEAD"` between PRs since the working tree changes as each one is committed and (optionally) removed from the branch.

## Best Practices

### Splitting Principles

- **Each PR should pass tests independently**: Don't create PRs that break builds
- **Prefer multiple small PRs over one large PR**: Easier to review and revert
- **Keep related changes together**: Don't artificially split code that changes together
- **Foundation before features**: Establish abstractions before using them
- **Use feature flags for incomplete work**: If a feature spans multiple PRs

### Common Split Patterns

1. **Refactoring + Feature**:
   - PR 1: Extract interface and refactor existing code
   - PR 2: Add new feature using the interface

2. **Multi-layer Feature**:
   - PR 1: Add data models and schema/database changes
   - PR 2: Add business logic layer
   - PR 3: Add API endpoints
   - PR 4: Add CLI/UI

3. **Package Restructuring**:
   - PR 1: Create new package structure (empty or minimal)
   - PR 2: Move code to new structure
   - PR 3: Update imports and references
   - PR 4: Clean up old structure

4. **Schema/Codegen-Driven Changes** (e.g. protobuf, GraphQL, Kubernetes CRDs, OpenAPI):
   - PR 1: Update schema/definitions and regenerate code
   - PR 2: Update logic that consumes the generated code
   - PR 3: Add validation/defaulting
   - PR 4: Update documentation and examples

### What NOT to Split

- **Atomic refactorings**: Renaming that touches many files but is one logical change
- **Generated code updates**: Schema/codegen output (protobuf, CRDs, mocks, lockfiles) should stay with the change that triggered it
- **Dependency updates**: Keep manifest and lockfile changes in one PR
- **Tightly coupled changes**: Changes that don't make sense independently

## Examples

### Example 1: Adding New CLI Command

**Current state**: 8 files changed, 450 lines

**Split strategy**:

- PR 1: Add business logic to core package (3 files, 200 lines)
- PR 2: Add CLI command and end-to-end tests (5 files, 250 lines)

**Rationale**: Business logic is independently testable and reusable

### Example 2: Refactoring + Feature

**Current state**: 15 files changed, 800 lines

**Split strategy**:

- PR 1: Extract common interface (2 files, 100 lines)
- PR 2: Refactor existing implementations to use interface (6 files, 300 lines)
- PR 3: Add new implementation with feature (7 files, 400 lines)

**Rationale**: Each PR is independently valuable and testable

### Example 3: Schema-Driven Enhancement

**Current state**: 12 files changed, 600 lines

**Split strategy**:

- PR 1: Update schema/definitions and generate code (4 files, 150 lines, mostly generated)
- PR 2: Update logic to handle new fields (5 files, 300 lines)
- PR 3: Add validation (3 files, 150 lines)

**Rationale**: Each PR represents a complete vertical slice of functionality

## User Interaction

After presenting the split strategy:

1. **Ask for feedback**: "Does this split make sense for your workflow?"
2. **Offer to adjust**: Be flexible based on the user's preferences
3. **Help with first PR**: "Would you like me to help create PR 1?" — if yes, follow step 8
4. **Create tracking**: "Should I create a GitHub issue to track all PRs?"

## Notes

- **Be pragmatic**: The goal is reviewable PRs, not arbitrary rules
- **Consider the team**: Some teams prefer different split strategies
- **Document dependencies**: Make it clear which PRs block others
- **Test independently**: Each PR should pass CI/CD checks
