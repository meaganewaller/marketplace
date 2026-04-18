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

### github

[🧭 Plugin README](plugins/github/README.md)

**Category:** development

Commands for interacting with GitHub issues and PRs using the gh CLI, plus agent skills for [release-please](https://github.com/googleapis/release-please) configuration and workflows.

**Contains:**

- **Commands:**
  - `/gh-issue-list` - List issues in the current GitHub repository
  - `/gh-issue-create` - Create a new issue in the current GitHub repository
  - `/gh-issue-view` - View details of a GitHub issue
  - `/gh-pr-list` - List pull requests in the current GitHub repository
  - `/gh-pr-create` - Create a new pull request from the current branch
  - `/gh-pr-view` - View details of a GitHub pull request
  - `/gh-pr-checkout` - Checkout a pull request locally
  - `/gh-pr-address-comments` - Address outstanding PR review comments
- **Skills:**
  - `release-please-configuration` - Configure release-please for monorepos and single-package repos (manifests, component tags, changelog sections, `extra-files`)
  - `release-please-pr-workflow` - Merge release-please PRs in monorepos (batch merges, conflict handling, iterating until pending release PRs clear)
  - `release-please-protection` - Avoid manual edits to release-please-managed files and align changes with conventional commits

**Installation:**

```bash
/plugin install github@meaganewaller-marketplace
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
