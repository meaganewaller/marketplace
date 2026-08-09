---
name: rails-testing
description: This skill should be used when the user asks "what kind of test should this be", "add a system test", "test a job or mailer", "set up VCR", "parallelize tests in CI", or needs an overall Rails testing strategy. For writing the examples themselves, use ruby-rspec-testing for spec/ or ruby-minitest-testing for test/.
---

# Rails Testing

Combine unit, integration, and system tests for confidence without redundancy.

## When to Use This Skill

- Choosing test type
- Testing jobs and mailers
- CI test parallelization

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
