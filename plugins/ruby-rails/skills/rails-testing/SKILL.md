---
name: rails-testing
description: Rails testing stack: fixtures, factories, system tests, VCR, and test helpers. Use for integrated Rails test strategy.
---

# Rails Testing

Combine unit, integration, and system tests for confidence without redundancy.

## When to Use This Skill

- Choosing test type
- Testing jobs and mailers
- CI test parallelization

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Pyramid**: Many model/unit tests, fewer system tests.

2. **Fixtures** fast; FactoryBot when project already uses it.

3. **System tests**: Cuprite (headless Chrome) — keep examples focused.

4. **Jobs/mailers**: `assert_enqueued_jobs`, `assert_emails`.

5. **VCR** for external HTTP; stub at boundary.

6. **CI**: `bin/rails db:test:prepare` then parallel `bin/rails test`.

## Quick Commands

```bash
mise exec -- bin/rails test
mise exec -- bin/rails test:system
mise exec -- bin/rails spec  # only if rspec installed
```

## Anti-Patterns

- Testing third-party APIs without isolation
- Shared DB state between parallel workers

## See Also

- **ruby-rspec-testing**
- **ruby-minitest-testing**
