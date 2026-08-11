---
name: ruby-gem-development
description: This skill should be used when the user asks to "create a gem", "run bundle gem", "write a gemspec", "cut a release", "bump the gem version", "publish to RubyGems", or "test against multiple Ruby versions in CI". For extracting code into a Rails engine instead, use rails-engines-gems.
---

# Ruby Gem Development

Build and publish gems with Bundler and standard layout.

## When to Use This Skill

- New gem from `bundle gem`
- Semver releases
- CI for multi-Ruby matrix

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
