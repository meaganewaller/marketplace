# ruby-rails Plugin Conventions

Shared defaults for every skill in this plugin. These are assumptions, not
mandates — a project that pins something different wins. Check the project's
`mise.toml`, `.ruby-version`, and `Gemfile` before applying any of them.

## Toolchain

Ruby is managed by **mise**, not rbenv, rvm, or asdf directly. If a repository
still carries rbenv or rvm config, say so rather than silently working around
it — see the `ruby-mise-environment` skill for migrating.

| Concern | Default |
|---|---|
| Ruby | 4.0.0+ unless the project pins otherwise |
| Rails | 8+ conventions and generators, where applicable |
| Version source | `mise.toml`, falling back to `.ruby-version` |

## Running Commands

Prefer binstubs and an explicit toolchain over bare invocations, so commands run
against the project's Ruby rather than whatever is first on `PATH`:

```bash
mise exec -- bin/rails console
mise exec -- bin/rspec spec/models/user_spec.rb
mise exec -- bundle exec rubocop
```

- Use `bin/rails`, `bin/rspec`, and `bin/rake` when the binstubs exist.
- Prefix with `mise exec --` when the project uses mise.
- Prefer `mise exec -- bundle exec` over bare `bundle exec` when a `Gemfile` is
  present.
- Never run `gem install` into the system Ruby to satisfy a project dependency.

## Type Systems

This plugin ships four type-signature skills, split along two axes — which type
system, and whether signatures live in the source or beside it:

| | Separate files | Inline in `.rb` |
|---|---|---|
| **RBS** | `generating-rbs` (`sig/**/*.rbs`) | `generating-rbs-inline` (`# @rbs`) |
| **Sorbet** | `generating-sorbet` (`rbi/**/*.rbi`) | `generating-sorbet-inline` (`sig { }`) |

Follow whatever the project already uses. **Never mix both systems in one
file**, and never mix inline and separate signatures for the same constant —
the type checker will read one and silently ignore the other.

## Testing

Rails 8 defaults to Minitest; many projects use RSpec instead. Match the project
rather than the default: `spec/` means RSpec (`ruby-rspec-testing`), `test/`
means Minitest (`ruby-minitest-testing`). `rails-testing` covers strategy and
Rails-specific test types across both.
