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

Commands for interacting with GitHub issues and PRs using the gh CLI.

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

**Installation:**

```bash
/plugin install github@meaganewaller-marketplace
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
