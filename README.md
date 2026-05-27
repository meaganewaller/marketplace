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

### cloudflare-expert

[🧭 Plugin README](plugins/cloudflare-expert/README.md)

**Category:** development

Expert guidance for Cloudflare Workers, storage, AI, Zero Trust, wrangler, and deployment workflows.

**Contains:**

- **Skills:**
  - `cloudflare-knowledge` - Cloudflare platform knowledge — Workers, Pages, R2, D1, KV, Durable Objects, AI, and Zero Trust. Includes 8 reference files for progressive disclosure.
- **Commands:**
  - `/cloudflare-expert:cloudflare-worker` - Create a new Cloudflare Worker with specified bindings and configuration
  - `/cloudflare-expert:cloudflare-deploy` - Deploy a Cloudflare Worker with environment configuration and secrets
  - `/cloudflare-expert:cloudflare-debug` - Debug Cloudflare Workers issues with diagnostic commands and solutions
  - `/cloudflare-expert:cloudflare-tunnel` - Create and configure a Cloudflare Tunnel for Zero Trust access
  - `/cloudflare-expert:cloudflare-ai` - Generate code for Cloudflare Workers AI tasks (TTS, STT, image, LLM)
- **Agents:**
  - `cloudflare-expert` - Expert agent for Cloudflare architecture, implementation, troubleshooting, and optimization

**Installation:**

```bash
/plugin install cloudflare-expert@meaganewaller-marketplace
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

### fnox

[🧭 Plugin README](plugins/fnox/README.md)

**Category:** utility

Fnox secrets management — configuration, provider setup, and security best practices via mise integration.

**Contains:**

- **Skills:**
  - `fnox-configuration` - Guides fnox.toml configuration — file structure, profiles, hierarchical config, mise integration, import/export, and sync. Includes 5 reference files for progressive disclosure.
  - `fnox-providers` - Provider selection and setup guide for age, AWS, 1Password, and other backends. Includes 4 reference files covering provider categories.
  - `fnox-security` - Security best practices: key rotation, gitignore rules, CI/CD patterns, access control, and avoiding common mistakes.

**Installation:**

```bash
/plugin install fnox@meaganewaller-marketplace
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

### mise

[🧭 Plugin README](plugins/mise/README.md)

**Category:** development

mise dev environment management — tool versions, environment variables, tasks, and project configuration.

**Contains:**

- **Skills:**
  - `mise-config` - mise.toml structure, config hierarchy, env vars, and idiomatic version file integration (2 reference files: config cascade, idiomatic version files)
  - `mise-tasks` - Writing and running mise tasks in mise.toml and mise-tasks/, task arguments, dependencies, and usage tool integration (1 reference file: task syntax)
  - `mise-tools` - Installing, pinning, and upgrading tool versions; backends including npm, cargo, pip, ubi, and asdf (1 reference file: backends)
- **Commands:**
  - `/mise:mise-init` - Scaffold mise.toml for the current project, detecting existing tool config files (.nvmrc, .ruby-version, etc.)
  - `/mise:mise-doctor` - Run mise doctor, interpret the output, and suggest fixes for any issues found
  - `/mise:mise-run` - List available mise tasks and run one interactively
- **Agents:**
  - `mise-setup` - Autonomous end-to-end mise setup — inspects project, detects tools, generates config, runs mise install and mise trust
- **Hooks:**
  - SessionStart: Silent when healthy; nudges if mise.toml is missing from a code project; surfaces mise doctor issues

**Installation:**

```bash
/plugin install mise@meaganewaller-marketplace
```

---

### ruby-rails

[🧭 Plugin README](plugins/ruby-rails/README.md)

**Category:** development

Ruby 4+ and Rails 8+ expert skills: mise toolchain, RBS/Sorbet type signatures, Active Record, Hotwire, testing, security, performance, and Kamal deployment.

**Contains:**

- **Skills:**

  Type signatures (RBS and Sorbet — pick one system per project; adapted from [ruby-type-signature-skills](https://github.com/DmitryPogrebnoy/ruby-agent-skills), MIT):

  - `generating-rbs` - Generates or updates RBS type signatures in separate `.rbs` files under `sig/` for Steep/RBS. Step-by-step workflow with validation; extensive reference examples.
  - `generating-rbs-inline` - Generates or updates RBS-inline `# @rbs` comment annotations in Ruby source (`# rbs_inline: enabled`). For projects that type in-file, not `sig/*.rbs`. Includes 26 reference files.
  - `generating-sorbet` - Generates or updates Sorbet `.rbi` shim files in `rbi/` without editing application source (gems, legacy code). Includes RBI syntax guides and production examples.
  - `generating-sorbet-inline` - Generates Sorbet `sig { }` blocks and `extend T::Sig` in source; preserves existing `# typed:` strictness. Includes 66 reference files.

  Rails and Ruby:

  - `rails-action-cable` - Action Cable, Solid Cable, and Turbo Streams broadcasts. Use for WebSockets and live UI.
  - `rails-active-storage` - Active Storage, direct uploads, image variants, and Action Mailbox/Text. Use for files and rich text.
  - `rails-activerecord` - Active Record: models, associations, validations, callbacks, scopes, and query interfaces. Use when working with persistence layer.
  - `rails-api-development` - API-only Rails apps, JSON rendering, versioning, and pagination. Use when building HTTP APIs without HTML.
  - `rails-application-boot` - Bootstrapping and configuring Rails 8 apps: new apps, config, environments, credentials, and initial structure. Use when creating or reconfiguring a Rails application.
  - `rails-authentication` - Rails 8 authentication generator, sessions, and authorization patterns (Pundit, Action Policy). Use when adding login or permissions.
  - `rails-background-jobs` - Active Job with Solid Queue (Rails 8 default), retries, and idempotency. Use when enqueueing background work.
  - `rails-caching` - Fragment, low-level, and HTTP caching with Solid Cache (Rails 8). Use when optimizing read-heavy paths.
  - `rails-controllers` - Rails controllers: strong parameters, filters, respond_to, streaming, and HTTP semantics. Use when implementing request handling.
  - `rails-database-migrations` - Schema migrations, multi-database, seeds, and structure.sql vs schema.rb. Use when changing the database shape.
  - `rails-deployment-kamal` - Deploy Rails 8 with Kamal, Docker, and production checklist. Use when shipping or configuring production.
  - `rails-engines-gems` - Rails engines, mountable apps, and internal gems. Use when extracting or packaging domain boundaries.
  - `rails-hotwire-turbo` - Hotwire Turbo Drive, Frames, and Streams for Rails 8 HTML apps. Use when building interactive pages without a heavy SPA.
  - `rails-performance` - N+1 detection, indexing, profiling, and query optimization. Use when app is slow or queries multiply.
  - `rails-routing` - Rails routing: REST, resources, scopes, concerns, shallow routes, and route helpers. Use when designing URLs or debugging `routes.rb`.
  - `rails-security` - Rails security: OWASP, CSRF, SQL injection, XSS, mass assignment, headers. Use when reviewing security or hardening apps.
  - `rails-stimulus-javascript` - Stimulus controllers, import maps, and modest JavaScript in Rails 8. Use when adding client behavior.
  - `rails-testing` - Rails testing stack: fixtures, factories, system tests, VCR, and test helpers. Use for integrated Rails test strategy.
  - `rails-view-layer` - ERB, layouts, partials, ViewComponent, helpers, and presenters. Use when building server-rendered UI.
  - `ruby-gem-development` - Authoring Ruby gems: gemspec, versioning, releases, and testing. Use when building libraries or extracting code from apps.
  - `ruby-language-idioms` - Ruby 4+ language idioms, Enumerable patterns, blocks, classes, modules, and RuboCop-friendly style. Use when writing or refactoring Ruby outside Rails-specific APIs.
  - `ruby-minitest-testing` - Minitest patterns for Ruby and Rails: assertions, parallel tests, fixtures, and Rails 8 default test stack. Use when working in `test/` directories or Minitest-only projects.
  - `ruby-mise-environment` - mise setup for Ruby 4+, Bundler, binstubs, Gemfile, and project tasks. Use when configuring Ruby versions, installing gems, or debugging bundle/ruby path issues.
  - `ruby-rspec-testing` - RSpec 3 patterns: expectations, contexts, shared examples, factories, and request specs. Use when writing or fixing RSpec tests in Ruby or Rails projects.

**Installation:**

```bash
/plugin install ruby-rails@meaganewaller-marketplace
```

---

### tools

[🧭 Plugin README](plugins/tools/README.md)

**Category:** utility

General purpose CLI tools: fd, ripgrep, jq, yq, shell scripting, ImageMagick, Mermaid diagrams, and universal dependency installation.

**Contains:**

- **Skills:**
  - `binary-analysis` - Reverse engineering and binary exploration using strings, binwalk, hexdump, xxd, file, and objdump
  - `deps-install` - Universal dependency installer that auto-detects the project's package manager (uv, bun, npm, yarn, pnpm, cargo, go, bundler, brew)
  - `fd-file-finding` - Fast file finding using fd with smart defaults, gitignore awareness, and parallel execution
  - `imagemagick-conversion` - Convert and manipulate images with ImageMagick (format conversion, resizing, batch processing)
  - `jq-json-processing` - JSON querying, filtering, and transformation with jq
  - `mermaid-diagrams` - Generate diagrams from text using Mermaid CLI (flowcharts, sequence, ERD, class, state, Gantt, git graphs) as SVG/PNG/PDF
  - `rg-code-search` - Fast code search using ripgrep with smart defaults, regex patterns, and file filtering
  - `shell-expert` - Shell scripting expertise, CLI automation, and cross-platform bash/zsh/POSIX best practices
  - `yq-yaml-processing` - YAML querying, filtering, and transformation with yq (Kubernetes manifests, GitHub Actions workflows)

**Installation:**

```bash
/plugin install tools@meaganewaller-marketplace
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
