---
name: ruby-rspec-testing
description: "RSpec 3 patterns: expectations, contexts, shared examples, factories, and request specs. Use when writing or fixing RSpec tests in Ruby or Rails projects."
---

# RSpec Testing

Structure fast, deterministic RSpec suites for Ruby libraries and Rails apps.

## When to Use This Skill

- Adding or fixing `spec/` examples
- Choosing between unit, request, and system specs
- Factory Bot vs fixtures

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

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
