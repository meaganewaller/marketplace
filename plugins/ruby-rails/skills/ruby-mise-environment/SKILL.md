---
name: ruby-mise-environment
description: mise setup for Ruby 4+, Bundler, binstubs, Gemfile, and project tasks. Use when configuring Ruby versions, installing gems, or debugging bundle/ruby path issues.
---

# Ruby mise Environment

Configure Ruby projects with mise as the single source of truth for Ruby version, env vars, and common tasks.

## When to Use This Skill

- Setting up Ruby on a new machine or repo
- Pinning Ruby 4.0+
- Running bundle/rails with correct Ruby
- Migrating from rbenv/rvm/asdf

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Pin Ruby in mise.toml** (preferred over orphan `.ruby-version`):

```toml
[tools]
ruby = "4.0"
bundler = "latest"
```

1. **Install and trust**:

```bash
mise install
mise trust   # if prompted in project root
```

1. **Bundler**: Always `bundle install` inside mise's Ruby. Use `bundle config set --local path vendor/bundle` only when the project already does.

2. **Binstubs**: Regenerate with `bundle binstubs bundler --all` or `bin/rails app:update:bin` when missing `bin/rails`.

3. **Tasks**: Define repeatable commands in `mise.toml`:

```toml
[tasks.test]
run = "bundle exec rspec"

[tasks.lint]
run = "bundle exec rubocop"
```

1. **CI parity**: CI should call `mise install` then `mise exec -- bundle exec …` so local and CI match.

## Quick Commands

```bash
mise install
mise exec -- ruby -v          # expect 4.0+
mise exec -- bundle install
mise exec -- bin/rails -v
mise exec -- bundle exec rspec
```

## Anti-Patterns

- Installing Ruby with rbenv/rvm when mise is the project standard
- Running `rails` without `bin/rails` or `bundle exec`
- Global gem installs (`gem install`) for app dependencies

## See Also

- **ruby-language-idioms** — Ruby style and patterns
- **rails-application-boot** — new Rails apps
