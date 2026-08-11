---
name: ruby-rspec-testing
description: This skill should be used when the user asks to "write an RSpec spec", "add a request spec", "fix a failing spec", "set up Factory Bot", "use shared examples", "stub time in a test", or is working under spec/. For Minitest instead, use ruby-minitest-testing; for choosing a test type or strategy, use rails-testing.
---

# RSpec Testing

Structure fast, deterministic RSpec suites for Ruby libraries and Rails apps.

## When to Use This Skill

- Adding or fixing `spec/` examples
- Choosing between unit, request, and system specs
- Factory Bot vs fixtures

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Layout**: `spec/models`, `spec/requests`, `spec/system` — keep system specs few and high-value.

2. **Factories**: Prefer `build_stubbed` when persistence is unnecessary; use traits for variants.

3. **Request specs** over controller specs for Rails HTTP behavior.

4. **Matchers**: Use composable matchers; avoid testing implementation details (private methods).

5. **Time**: Use `travel_to` / ActiveSupport time helpers in Rails; `Timecop` only if already in project.

6. **Run**:

```bash
mise exec -- bundle exec rspec
mise exec -- bundle exec rspec spec/models/user_spec.rb:42
```

## Quick Commands

```bash
mise exec -- bundle exec rspec
mise exec -- bundle exec rspec --format documentation
mise exec -- bundle exec rspec --only-failures
```

## Anti-Patterns

- `before(:all)` with DB mutations (leaks state)
- Testing Rails callbacks instead of observable behavior
- Giant shared contexts that hide setup

## See Also

- **rails-testing** — Rails-specific test types
- **ruby-minitest-testing** — Minitest alternative
