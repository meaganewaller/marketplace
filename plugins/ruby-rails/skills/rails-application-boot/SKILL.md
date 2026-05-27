---
name: rails-application-boot
description: Bootstrapping and configuring Rails 8 apps: new apps, config, environments, credentials, and initial structure. Use when creating or reconfiguring a Rails application.
---

# Rails Application Boot

Create and configure Rails 8 applications using current defaults and mise-managed Ruby.

## When to Use This Skill

- `rails new` and initial gem choices
- Environment config (`config/environments`)
- Credentials and master key workflow

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Create app** (Ruby via mise):

```bash
mise use ruby@4.0
gem install rails -v "~> 8.0"
mise exec -- rails new myapp --database=postgresql
```

1. **Rails 8 defaults**: Solid Queue, Solid Cache, Solid Cable, Propshaft, Kamal-ready Dockerfile — keep unless you have a reason to opt out.

2. **Config**: Prefer `config.x` custom config in `application.rb` over global constants.

3. **Credentials**: `bin/rails credentials:edit` — never commit keys; document required keys in README.

4. **Health**: Use `/up` health check (Rails 7.1+) for orchestrators.

5. **bin/dev**: Use `bin/dev` (Foreman/Overmind) when `Procfile.dev` exists.

## Quick Commands

```bash
mise exec -- rails new shop --database=postgresql
cd shop && mise trust && mise install
mise exec -- bin/rails about
mise exec -- bin/rails credentials:edit
```

## Anti-Patterns

- Disabling Zeitwerk without strong reason
- Storing secrets in `.env` committed to git
- Skipping `db:prepare` in CI

## See Also

- **rails-database-migrations**
- **rails-deployment-kamal**
