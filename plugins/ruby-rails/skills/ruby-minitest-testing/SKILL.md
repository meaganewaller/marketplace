---
name: ruby-minitest-testing
description: Minitest patterns for Ruby and Rails: assertions, parallel tests, fixtures, and Rails 8 default test stack. Use when working in `test/` directories or Minitest-only projects.
---

# Minitest Testing

Use Minitest effectively — Rails 8's default — with clear structure and parallel execution.

## When to Use This Skill

- Writing `test/` files in Rails
- Converting from RSpec
- Speeding up unit tests

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Rails generators** produce Minitest by default unless configured for RSpec.

2. **Parallelize** in `test_helper.rb` when tests are isolated:

```ruby
parallelize(workers: :number_of_processors)
```

1. **Fixtures** for stable baseline data; factories (factory_bot) only if already adopted.

2. **Integration vs system**: Use `ActionDispatch::IntegrationTest` for HTTP; system tests for full browser (Cuprite/Selenium).

3. **Run**:

```bash
mise exec -- bin/rails test
mise exec -- bin/rails test test/models/user_test.rb
```

## Quick Commands

```bash
mise exec -- bin/rails test
mise exec -- bin/rails test:system
mise exec -- PARALLEL_WORKERS=4 bin/rails test
```

## Anti-Patterns

- Disabling transactional tests without cleaning DB
- Sleep-based timing instead of `perform_enqueued_jobs`

## See Also

- **rails-testing**
- **ruby-rspec-testing**
