# Ruby on Rails

Expert guidance for **Ruby 4.0+** and **Rails 8+** development using **mise** as the default toolchain manager.

## Installation

```bash
/plugin install ruby-rails@meaganewaller-marketplace
```

## Defaults

| Topic | Assumption |
| ----- | ---------- |
| Toolchain | mise (not rbenv, rvm, or asdf directly) |
| Ruby | 4.0.0+ |
| Rails | 8+ (Solid Queue/Cache/Cable, Kamal, Propshaft) |
| Commands | `mise exec --`, `bin/rails`, `bundle exec` |

## Components

### Commands

(None yet)

### Skills

#### Ruby toolchain and language

| Skill | Focus |
| ----- | ----- |
| **ruby-mise-environment** | mise, Bundler, binstubs, Gemfile, project tasks |
| **ruby-language-idioms** | Ruby 4 idioms, enumerables, style, RuboCop |
| **ruby-rspec-testing** | RSpec unit, request, and system specs |
| **ruby-minitest-testing** | Minitest (Rails 8 default test stack) |
| **ruby-gem-development** | Gem authoring, gemspec, releases |

#### Type signatures (RBS and Sorbet)

Adapted from [ruby-type-signature-skills](https://github.com/DmitryPogrebnoy/ruby-agent-skills/tree/main/plugins/ruby-type-signature-skills) (MIT).

| Skill | Focus |
| ----- | ----- |
| **generating-rbs** | `sig/**/*.rbs` signatures for Steep/RBS |
| **generating-rbs-inline** | `# @rbs` / rbs-inline comments in `.rb` files |
| **generating-sorbet** | `rbi/**/*.rbi` shim files without editing source |
| **generating-sorbet-inline** | `sig { }` blocks and `# typed:` sigils in source |

Each skill includes reference material for syntax and production examples. Pick **one** system per project (RBS vs Sorbet; inline vs separate files).

#### Rails application core

| Skill | Focus |
| ----- | ----- |
| **rails-application-boot** | New apps, config, credentials, environments |
| **rails-routing** | REST, resources, namespaces, concerns |
| **rails-controllers** | Actions, strong params, responses, Turbo |
| **rails-activerecord** | Models, associations, validations, queries |
| **rails-database-migrations** | Migrations, indexes, seeds, multi-DB |

#### UI and frontend (Hotwire)

| Skill | Focus |
| ----- | ----- |
| **rails-hotwire-turbo** | Turbo Drive, Frames, Streams |
| **rails-stimulus-javascript** | Stimulus, import maps |
| **rails-view-layer** | ERB, ViewComponent, helpers, forms |

#### Infrastructure and operations

| Skill | Focus |
| ----- | ----- |
| **rails-background-jobs** | Active Job, Solid Queue, idempotency |
| **rails-caching** | Fragment/HTTP caching, Solid Cache |
| **rails-action-cable** | Action Cable, Solid Cable, broadcasts |
| **rails-active-storage** | Active Storage, Action Text |
| **rails-deployment-kamal** | Kamal, Docker, production checklist |

#### API, auth, and security

| Skill | Focus |
| ----- | ----- |
| **rails-api-development** | API-only apps, JSON, versioning |
| **rails-authentication** | Sessions, Rails 8 auth generator, authorization |
| **rails-security** | OWASP, Brakeman, CSP, mass assignment |

#### Quality and architecture

| Skill | Focus |
| ----- | ----- |
| **rails-testing** | Integration, system tests, CI strategy |
| **rails-performance** | N+1, indexing, profiling |
| **rails-engines-gems** | Engines, mountable apps, path gems |

### Agents

(None yet)

### Hooks

- **SessionStart**: Ensures [Solargraph](https://solargraph.org/) is installed for LSP (via `mise exec -- gem install` when needed)

### LSP (Language Server)

[Solargraph](https://solargraph.org/) integration for Claude Code (requires Claude Code v2.1.0+ with LSP support). Adapted from [claude-code-lsps/solargraph](https://github.com/boostvolt/claude-code-lsps/tree/main/solargraph) (MIT).

| Language | Extensions | Server |
| -------- | ---------- | ------ |
| Ruby | `.rb`, `.rake`, `.gemspec`, `.ru` | Solargraph (`stdio`) |

**LSP capabilities** (via Claude's built-in LSP tool): `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, call hierarchy, and automatic diagnostics.

**Project setup** (recommended for Rails apps):

```bash
mise exec -- gem install solargraph
mise exec -- solargraph config
# Add solargraph to Gemfile development group in team projects
```

### MCP Servers

(None yet)

## Usage

Skills activate automatically when you work on matching Ruby/Rails tasks (routing, migrations, Hotwire, etc.). For project-wide defaults, the plugin includes `CLAUDE.md` scoped to common Ruby/Rails file globs.

With this plugin installed, Claude Code starts Solargraph on session start for Ruby files when the gem is available.

### Example: pin Ruby with mise

```bash
mise use ruby@4.0
mise install
mise exec -- bin/rails new myapp --database=postgresql
```

### Example: run tests

```bash
mise exec -- bin/rails test
mise exec -- bundle exec rspec
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
