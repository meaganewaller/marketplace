# Git Plugin

Commands, skills, agents, and hooks for Git and GitHub workflows — commits, branches, PRs, issues, release automation, and repository management.

## Installation

```bash
/plugin install git@meaganewaller-marketplace
```

## Prerequisites

- [GitHub CLI (gh)](https://cli.github.com/) must be installed and authenticated

## Components

### Commands

- `/git:gh-issue-list` - List issues in the current repository
- `/git:gh-issue-create` - Create a new issue
- `/git:gh-issue-view` - View details of an issue
- `/git:gh-pr-list` - List pull requests in the current repository
- `/git:gh-pr-create` - Create a new pull request
- `/git:gh-pr-view` - View details of a pull request
- `/git:gh-pr-checkout` - Checkout a pull request locally
- `/git:gh-pr-address-comments` - Address outstanding PR review comments

### Skills

Agent skills live under `skills/` and are loaded automatically by context (they are not slash commands).

#### Core Git Workflow

- `git-commit` — Create commits with conventional messages and auto-detected issue references
- `git-push` — Push local commits to remote with branch tracking and upstream setup
- `git-pr` — Create pull requests with descriptions, labels, and issue references
- `git-commit-push-pr` — Complete workflow from uncommitted changes to open PR in one step
- `git-branch-pr-workflow` — Branch management, PR workflows, and GitHub integration (git switch, git restore, main-branch-development pattern)
- `git-branch-naming` — Branch naming conventions: type prefixes (feat, fix, chore), issue linking, kebab-case
- `git-commit-workflow` — Commit message conventions, explicit staging workflow, conventional commits, logical change grouping
- `git-commit-trailers` — Git commit trailer conventions: BREAKING CHANGE, Release-As, Co-authored-by, Signed-off-by

#### Conflict Resolution & Rebasing

- `git-conflicts` — Resolve merge conflicts file-by-file with modern git tooling
- `git-resolve-conflicts` — Resolve merge conflicts in pull requests
- `git-rebase-patterns` — Advanced rebase patterns: linear history, stacked PRs, --update-refs, --onto, interactive rebase

#### Forks & Upstream

- `git-fork-workflow` — Fork management, upstream synchronization, divergence detection, and sync strategies
- `git-upstream-pr` — Submit clean PRs to upstream repositories: cherry-pick fork commits, squash, cross-fork PR creation
- `git-api-pr` — Create PRs via GitHub API without local git operations (quick fixes, config updates, bypassing local git state)

#### Issues & Pull Requests

- `git-issue` — Process GitHub issues end-to-end with TDD, interactive selection, conflict detection, and parallel work support
- `git-issue-manage` — Administrative operations: transfer between repos, pin, lock, create dev branches, bulk operations
- `git-issue-hierarchy` — Manage sub-issues and native GitHub dependency relationships (blocked_by/blocking)
- `git-pr-feedback` — Review PR workflow results and address reviewer comments with resolution tracking
- `git-fix-pr` — Analyze and fix failing PR checks; reads CI logs and applies automated fixes
- `git-triage` — Triage open issues and PRs: scan for completion evidence, flag stale items, recommend actions

#### GitHub Conventions

- `github-issue-autodetect` — Automatically detect GitHub issues that staged changes may fix, suggests closing keywords (Fixes, Closes, Resolves)
- `github-issue-writing` — Create well-structured GitHub issues with clear titles, descriptions, and acceptance criteria
- `github-labels` — Discover and apply labels to PRs and issues; create new labels for a repository
- `github-pr-title` — Craft PR titles using conventional commits format to drive release-please automation

#### Release Automation

- `release-please-configuration` — Configure release-please for monorepos and single-package repos: manifest files, component tagging, changelog sections, `extra-files`
- `release-please-pr-workflow` — Manage release-please PR merging: batch merges, conflict resolution via close/recreate, iterate until all PRs clear
- `release-please-protection` — Detect and prevent manual edits to release-please-managed files (CHANGELOG.md, version fields)

#### Repository Health

- `git-maintain` — Repository maintenance and cleanup: garbage collection, branch pruning, stash cleanup, fsck
- `git-security-checks` — Pre-commit security validation and secret detection via gitleaks; integrates with pre-commit hooks
- `git-derive-docs` — Analyze git history to derive undocumented rules, PRDs, ADRs, and PRPs from commit patterns

#### Agentic Helpers

- `git-cli-agentic` — Git commands optimized for AI agent workflows: porcelain=v2 output, --numstat diffs, custom --format log placeholders
- `gh-cli-agentic` — GitHub CLI commands optimized for AI agents: JSON output, deterministic execution, sub-issues, PR checks
- `gh-workflow-monitoring` — Monitor GitHub Actions workflow runs with blocking watch instead of polling loops
- `git-coworker-check` — Detect whether another Claude agent is working in the same repo clone before destructive git operations
- `git-repo-detection` — Detect GitHub repository name and owner from git remotes for CLI and API calls

### Agents

- `git-ops` — Specialized agent for complex git write operations. Handles merge conflicts, rebases, cherry-picks, bisect, and multi-step git workflows. Use when git operations are verbose or multi-step to keep that output isolated from the main context.

### Hooks

- **PreToolUse (Bash):** Validates PR bodies contain issue closing keywords before push; checks PR metadata
- **PreToolUse (mcp__github__create_pull_request):** Ensures PR body includes closing keywords (Closes #N, Fixes #N, Resolves #N) for feature/bug PRs

## Usage

### Issues

```bash
# List open issues
/git:gh-issue-list

# Create a new issue
/git:gh-issue-create

# View issue #42
/git:gh-issue-view 42
```

### Pull Requests

```bash
# List open PRs
/git:gh-pr-list

# Create a PR from current branch
/git:gh-pr-create

# View PR #123
/git:gh-pr-view 123

# Checkout PR #123 locally
/git:gh-pr-checkout 123

# Address review comments on current branch's PR
/git:gh-pr-address-comments

# Address review comments on PR #123
/git:gh-pr-address-comments 123
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
