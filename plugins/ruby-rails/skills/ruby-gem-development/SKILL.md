---
name: ruby-gem-development
description: "Authoring Ruby gems: gemspec, versioning, releases, and testing. Use when building libraries or extracting code from apps."
---

# Ruby Gem Development

Build and publish gems with Bundler and standard layout.

## When to Use This Skill

- New gem from `bundle gem`
- Semver releases
- CI for multi-Ruby matrix

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Structure**: `lib/my_gem.rb` loaded by gemspec files list.

2. **Version**: `MyGem::VERSION` single source.

3. **Test**: RSpec or Minitest in gem; include Rails engine dummy only if needed.

4. **Release**: `bundle exec rake release` with 2FA on RubyGems.

5. **Ruby 4**: Declare required_ruby_version in gemspec.

## Quick Commands

```bash
mise exec -- bundle gem my_gem
cd my_gem && mise use ruby@4.0 && bundle exec rake spec
```

## Anti-Patterns

- Requiring rails in non-Rails gems
- Open-ended dependencies in gemspec

## See Also

- **rails-engines-gems**
