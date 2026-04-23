# my marketplace

these are my plugins. you may like them?

## install

add this marketplace

```txt
# From GitHub
/plugin marketplace add meaganewaller/marketplace
```

## available plugins

### bun

[🧭 Plugin README](plugins/bun/README.md)

**Category:** development

Bun runtime patterns, bunx, shell scripting, lockfile management, and testing guidance.

**Contains:**

- **Skills:**
  - `bun-runtime` - Provides Bun runtime guidance including bunx, shell scripting, lockfile management, resolution, and testing patterns. Includes 5 reference files for progressive disclosure.

**Installation:**

```bash
/plugin install bun@meaganewaller-marketplace
```

---

### decision-journal

[🧭 Plugin README](plugins/decision-journal/README.md)

**Category:** utility

Captures tradeoffs and related decisions into markdown automatically.

**Contains:**

- **Hooks:**
  - PostToolUse (Write|Edit): Creates markers for large changes
  - PreCompact (auto): Triggers capture agent before compaction
  - Stop: Cleans up old markers
- **Agents:**
  - `capture-decisions`: Analyzes context and writes rich journal entries

**Installation:**

```bash
/plugin install decision-journal@meaganewaller-marketplace
```

---

### git

[🧭 Plugin README](plugins/git/README.md)

**Category:** development

Git and GitHub workflows: commits, branches, PRs, issues, release automation, and repository management.

**Contains:**

- **Commands:**
  - `/git:gh-issue-list` - List issues in the current GitHub repository
  - `/git:gh-issue-create` - Create a new issue in the current GitHub repository
  - `/git:gh-issue-view` - View details of a GitHub issue
  - `/git:gh-pr-list` - List pull requests in the current GitHub repository
  - `/git:gh-pr-create` - Create a new pull request from the current branch
  - `/git:gh-pr-view` - View details of a GitHub pull request
  - `/git:gh-pr-checkout` - Checkout a pull request locally
  - `/git:gh-pr-address-comments` - Address outstanding PR review comments
- **Skills:**
  - `git-commit` - Create commits with conventional messages and issue references
  - `git-push` - Push local commits to remote repositories with branch tracking
  - `git-pr` - Create pull requests with descriptions, labels, and issue references
  - `git-commit-push-pr` - Complete workflow from uncommitted changes to open PR in one step
  - `git-branch-pr-workflow` - Branch management, PR workflows, and GitHub integration
  - `git-branch-naming` - Branch naming conventions with type prefixes and issue linking
  - `git-commit-workflow` - Commit message conventions, staging practices, and conventional commits
  - `git-commit-trailers` - Git commit trailer conventions (BREAKING CHANGE, Release-As, Co-authored-by)
  - `git-conflicts` - Resolve merge conflicts file-by-file with modern git tooling
  - `git-resolve-conflicts` - Resolve merge conflicts in pull requests
  - `git-rebase-patterns` - Advanced rebase patterns for linear history and stacked PRs
  - `git-fork-workflow` - Fork management and upstream synchronization
  - `git-upstream-pr` - Submit clean PRs to upstream repositories from a fork
  - `git-issue` - Process GitHub issues end-to-end with TDD and parallel work support
  - `git-issue-manage` - Administrative operations on GitHub issues (transfer, pin, lock, bulk ops)
  - `git-issue-hierarchy` - Manage sub-issues and GitHub dependency relationships (blocked_by/blocking)
  - `git-pr-feedback` - Review PR workflow results and address reviewer comments
  - `git-fix-pr` - Analyze and fix failing PR checks
  - `git-triage` - Triage open GitHub issues and PRs in one sweep with backlog grooming
  - `git-maintain` - Repository maintenance and cleanup (gc, prune, branch cleanup)
  - `git-security-checks` - Pre-commit security validation and secret detection via gitleaks
  - `git-derive-docs` - Derive undocumented rules, PRDs, ADRs, and PRPs from git history
  - `git-coworker-check` - Detect whether another Claude agent is working in the same repo clone
  - `git-api-pr` - Create PRs via GitHub API without local git operations
  - `git-repo-detection` - Detect GitHub repository name and owner from git remotes
  - `git-cli-agentic` - Git commands optimized for AI agent workflows with porcelain output
  - `gh-cli-agentic` - GitHub CLI commands optimized for AI agent workflows with JSON output
  - `gh-workflow-monitoring` - Monitor GitHub Actions workflow runs with blocking watch commands
  - `github-issue-autodetect` - Automatically detect GitHub issues that staged changes may fix
  - `github-issue-writing` - Create well-structured GitHub issues with clear titles and acceptance criteria
  - `github-labels` - Discover and apply labels to GitHub PRs and issues
  - `github-pr-title` - Craft PR titles using conventional commits format for release-please automation
  - `release-please-configuration` - Configure release-please for monorepos and single-package repos
  - `release-please-pr-workflow` - Merge release-please PRs in monorepos with conflict handling
  - `release-please-protection` - Avoid manual edits to release-please-managed files
- **Agents:**
  - `git-ops` - Specialized agent for complex git write operations (conflicts, rebases, bisect, cherry-picks)
- **Hooks:**
  - PreToolUse (Bash): Validates PR issue links and checks PR metadata on push
  - PreToolUse (mcp__github__create_pull_request): Ensures PR body contains issue closing keywords

**Installation:**

```bash
/plugin install git@meaganewaller-marketplace
```

---

### typescript-architect

[🧭 Plugin README](plugins/typescript-architect/README.md)

**Category:** development

TypeScript architecture, SOLID principles, design patterns, and clean code standards for building maintainable Bun/TypeScript applications.

**Contains:**

- **Skills:**
  - `solid-principles` - Analyze and apply SOLID principles to TypeScript code (5 reference files: SRP, OCP, LSP, ISP, DIP)
  - `design-patterns` - Select and implement design patterns in TypeScript (3 reference files: creational, structural, behavioral)
  - `type-system-design` - Design advanced TypeScript types for safety and expressiveness (3 reference files: generics, branded types, advanced types)
  - `frontend-architecture` - Design frontend architecture for React/TypeScript applications served by Bun (3 reference files: component patterns, state management, project structure)
  - `backend-architecture` - Design backend architecture for Bun/TypeScript servers (3 reference files: service patterns, repository patterns, error handling)
  - `code-quality-audit` - Audit TypeScript code for quality, complexity, coupling, and clean code violations (3 reference files: clean code checklist, anti-patterns, metrics)
- **Commands:**
  - `/typescript-architect:audit` - Run a code quality audit on TypeScript files
  - `/typescript-architect:architect` - Get architecture guidance for designing a feature or module
- **Agents:**
  - `architecture-reviewer` - Read-only agent that reviews TypeScript code for architectural quality, SOLID compliance, pattern usage, and clean code standards

**Installation:**

```bash
/plugin install typescript-architect@meaganewaller-marketplace
```

---

> **Note:** The `example-plugin` in `plugins/example-plugin/` is a template for creating new plugins and is not published to the marketplace.

## development

this is a monorepo with multiple plugins. each plugin is a separate npm package in the `plugins/` directory.

### quick start

clone this repo and run the following commands to get started:

```bash
# install bun via mise
mise install

# install deps, run prepare scripts
bun install

# run tests for all plugins
bun test
```
