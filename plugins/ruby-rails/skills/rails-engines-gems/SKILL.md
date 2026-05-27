---
name: rails-engines-gems
description: Rails engines, mountable apps, and internal gems. Use when extracting or packaging domain boundaries.
---

# Rails Engines and Gems

Package bounded context as engines or path gems.

## When to Use This Skill

- Engine extraction
- Shared domain gem across apps

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Engine**: `rails plugin new my_engine --mountable`.

2. **Isolate namespace** to avoid constant collisions.

3. **Dependencies** declared in gemspec; apps depend on gem version.

4. **Test engine** in `test/dummy` app.

## Quick Commands

```bash
mise exec -- rails plugin new billing --mountable
mise exec -- bundle exec rake test
```

## Anti-Patterns

- Circular deps between engine and host
- Engine reaching host app constants

## See Also

- **ruby-gem-development**
