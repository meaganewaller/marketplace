---
description: Ruby 4+ and Rails 8+ development with mise as the default toolchain manager.
globs: "*.rb,*.rake,Gemfile,Gemfile.lock,Rakefile,config/**/*.yml,config/**/*.rb,app/**/*.rb,spec/**/*.rb,test/**/*.rb,.ruby-version,mise.toml,.mise.toml"
alwaysApply: false
---

Default assumptions for this plugin:

- **Toolchain**: Use [mise](https://mise.jdx.dev) for Ruby, Node (if needed), and task runners — not rbenv, rvm, asdf, or chruby directly.
- **Ruby**: Target **Ruby 4.0.0+** unless the project pins an older version in `mise.toml` or `.ruby-version`.
- **Rails**: Target **Rails 8+** defaults (Solid Queue/Cache/Cable, Kamal, built-in authentication generator, Propshaft, import maps).
- **Bundler**: Use `bundle exec` for Rails and gem binaries; prefer `bin/rails`, `bin/rspec`, `bin/rubocop` binstubs when present.
- **Commands**: Run via mise — e.g. `mise exec -- ruby -v`, `mise exec -- bin/rails routes`, or project tasks in `mise.toml`.

When a skill from this plugin applies, read its `SKILL.md` and follow it before improvising Ruby/Rails guidance.
