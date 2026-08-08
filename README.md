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

Bun runtime, package management, testing, bundling, and standalone executables — verified against the Bun CLI, not recalled.

**Contains:**

- **Skills:**
  - `bun-runtime` - Bun across all four of its roles: runtime, package manager, bundler, and test runner. Records the flags and config keys that are commonly invented but do not exist. Includes 8 reference files for progressive disclosure (package management, security, testing, building, built-in APIs, shell, resolution, bunx).
- **Scripts:**
  - `bun-project-audit.sh` - Reports Bun version, lockfile format and whether it needs migrating, workspace layout, config files, and blocked lifecycle scripts

**Installation:**

```bash
/plugin install bun@meaganewaller-marketplace
```

---

### dotfiles

[🧭 Plugin README](plugins/dotfiles/README.md)

**Category:** utility

Chezmoi-managed dotfiles workflow: source-only edits, templates, run_onchange scripts, BATS tests, ADRs, and mise/Homebrew package routing.

**Contains:**

- **Skills:**
  - `dotfiles-config` - Resolves and stores the dotfiles repo path in `.claude/dotfiles.local.md`; other skills route through this for the working tree
  - `chezmoi-workflow` - Day-to-day Chezmoi loop: edit → diff → apply → status; partial apply and drift recovery
  - `chezmoi-templates` - Writing and debugging `.tmpl` files with Go `text/template` (lookPath, stat, joinPath, OS branching)
  - `chezmoi-data` - Adding and editing YAML/TOML files under `home/.chezmoidata/` (aliases, packages, themes)
  - `chezmoi-externals` - Managing `home/.chezmoiexternals/` for third-party content; pinning for Renovate compatibility
  - `chezmoi-scripts` - Authoring `run_once_*` and `run_onchange_*` scripts: idempotency, strict mode, DEBUG awareness
  - `bats-testing` - Writing BATS specs for the dotfiles repo; shared helpers and the `./bin/test` runner
  - `package-management` - Routing new tools to mise / Homebrew / externals; when to escalate to the package-manager agent
  - `adr-writing` - Numbered ADRs under `docs/adrs/` in the existing format with cross-linking
- **Commands:**
  - `/dotfiles:dotfiles-status` - `chezmoi diff` + `chezmoi status` + `mise doctor` in one snapshot
  - `/dotfiles:dotfiles-apply` - Preview-then-apply loop: diff → confirm → apply → status
  - `/dotfiles:dotfiles-new-managed-file` - Scaffold a new file under `home/` with the right `dot_` / `dot_config/` / `private_` prefix
  - `/dotfiles:dotfiles-new-adr` - Scaffold the next-numbered ADR under `docs/adrs/`
- **Agents:**
  - `chezmoi-source-guardian` - Handles cross-file source-tree refactors (renames, template→data splits, `dot_*` → `private_*`)
  - `package-manager` - Bulk and security-sensitive manifest edits (Docker Compose, devcontainer, GitHub Actions digests, Renovate config)
- **Hooks:**
  - PreToolUse (Write|Edit): Blocks writes to Chezmoi-managed paths under `~`; suggests the corresponding source path
  - PostToolUse (Write|Edit): Prints a one-line reminder to run `chezmoi diff` after edits under `home/`

**Installation:**

```bash
/plugin install dotfiles@meaganewaller-marketplace
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

### git-workflow

[🧭 Plugin README](plugins/git-workflow/README.md)

**Category:** development

Git and GitHub workflow skills — commits, pull requests, issues, and PR splitting, sharing one set of conventional-commit and issue-linking rules.

**Contains:**

- **Skills:**
  - `commit` - Create a commit with intentional file selection, conventional-commit format, mood emoji, and an American English pass. Supports `--amend`.
  - `pr` - Gather context, draft a Why/What/Notes body, and open the PR in the browser for final human review — never submits directly.
  - `issue` - File a well-structured GitHub issue: duplicate search, native issue types, acceptance criteria, and labels applied at creation.
  - `split-pr` - Read-only analysis of a large diff, proposing a split by logical concern with a suggested creation order.
- **Rules:** 6 shared reference documents (conventional commits, mood emoji, issue linking, issue detection, GitHub labels, branch naming) that the skills cross-reference instead of duplicating.
- **Executables:** (in `bin/`, added to the Bash tool's `PATH` when the plugin is enabled)
  - `pr-context` - Collects branch, commit range, diff stats, CI status, and referenced issues in one execution
  - `gh-pr-create-web` - Shim that injects `--web` so PRs always open in the browser
  - `claude-session-gist` - Publishes the session transcript as a secret Gist, refusing outright for blocklisted repos
  - `claude-extract-session` - Extracts a session by ID to markdown

**Installation:**

```bash
/plugin install git-workflow@meaganewaller-marketplace
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

### meta

[🧭 Plugin README](plugins/meta/README.md)

**Category:** development

Evaluation layer for Claude Code plugins — scored skill and plugin audits, hook and rules evals, and context-footprint reports against bundled checklists.

**Contains:**

- **Skills:**
  - `modular-skill-framework` - Composable skill design: boundaries, interfaces, token efficiency, and split/merge heuristics (3 reference files)
- **References** (judging criteria, loaded on demand rather than always-on):
  - `skill-quality-checklist.md` - pass/fail criteria for a skill
  - `marketplace-checklist.md` - layout, manifest, marketplace registration
  - `hook-checklist.md` - `hooks.json` and hook script conventions
  - `command-patterns.md` - command frontmatter and writing conventions
- **Commands:**
  - `/meta:create-command` - Scaffold a new slash command in a plugin using meta conventions
  - `/meta:validate-plugin` - Validate plugin layout, manifest, and marketplace registration
  - `/meta:validate-hook` - Validate `hooks/hooks.json`, scripts, and portable paths
  - `/meta:audit-skill` - Audit a skill for structure, triggers, and quality best practices
  - `/meta:test-skill` - Run behavioral scenarios against a single skill for trigger and rule compliance
  - `/meta:skills-eval` - Batch-evaluate all skills in a plugin or directory (optional `--deep` probes)
  - `/meta:context-optimization-report` - Context window footprint report, size tiers, and modularization priorities
  - `/meta:rules-eval` - Evaluate Cursor rules, `CLAUDE.md`, and `AGENTS.md` for clarity and enforceability
  - `/meta:hooks-eval` - Evaluate plugin hooks statically and run companion test scripts when present
- **Agents:**
  - `plugin-auditor` - Scored plugin audit (layout, manifest, marketplace registration, README inventory, hooks/MCP)
  - `skill-auditor` - Scored skill quality audits (structure, content, token efficiency, activation, tool integration)

> Authoring guidance (`SKILL.md` structure, command frontmatter, hook events, plugin layout) lives in the **plugin-dev** plugin. Meta judges plugins rather than teaching how to write them, so it ships one skill instead of duplicating four.

**Installation:**

```bash
/plugin install meta@meaganewaller-marketplace
```

---

### ruby-rails

[🧭 Plugin README](plugins/ruby-rails/README.md)

**Category:** development

Ruby 4+ and Rails 8+ expert skills: mise toolchain, Ruby LSP, RBS/Sorbet type signatures, Active Record, Hotwire, testing, security, performance, and Kamal deployment.

**Contains:**

- **LSP:**
  - **Ruby LSP** — Official Ruby language server for `.rb`, `.rake`, `.gemspec`, `.ru` (goToDefinition, hover, references, symbols, completion, diagnostics). Requires Claude Code v2.1.0+.
- **Hooks:**
  - SessionStart: Installs `ruby-lsp` via `mise exec -- gem install` when missing
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

### sitegraph

[🧭 Plugin README](plugins/sitegraph/README.md)

**Category:** utility

Filesystem-as-navigation-graph static sites for technical reports, audits, and dashboards — auto-discovered nav rail and sitemap, CDN-served CSS kernel, zero-build.

**Contains:**

- **Skills:**
  - `rebuild-nav` - Rebuilds the sitemap and per-page navigation rail by walking the site's folder structure. Use after adding, moving, renaming, or removing pages, or when regenerating breadcrumbs and prev/next links (1 reference file: authoring)
- **Scripts:**
  - `build-nav.ts` - Walks the site root and regenerates nav rail, breadcrumbs, sitemap, and prev/next links
- **Assets:**
  - `kernel.css` - CDN-served CSS kernel used by generated pages

**Installation:**

```bash
/plugin install sitegraph@meaganewaller-marketplace
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
