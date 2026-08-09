---
name: rails-engines-gems
description: This skill should be used when the user asks to "extract this into an engine", "create a mountable app", "pull this code into an internal gem", "isolate a namespace", or "share domain code between two Rails apps". For publishing a standalone Ruby library, use ruby-gem-development.
---

# Rails Engines and Gems

Package bounded context as engines or path gems.

## When to Use This Skill

- Engine extraction
- Shared domain gem across apps

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
