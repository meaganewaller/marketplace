---
name: rails-background-jobs
description: Active Job with Solid Queue (Rails 8 default), retries, and idempotency. Use when enqueueing background work.
---

# Rails Background Jobs

Run async work through Active Job with Solid Queue in development and production.

## When to Use This Skill

- New jobs
- Recurring tasks
- Job idempotency and retries

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Generate**: `bin/rails generate job ProcessImport`.

2. **Solid Queue** (Rails 8): configured by default — use `config/recurring.yml` for schedules.

3. **Perform later**: `SomeJob.perform_later(args)` — pass IDs, not Active Record objects.

4. **Idempotency**: Jobs must tolerate retry; use row-level locks or unique indexes.

5. **Test**: `perform_enqueued_jobs` / `assert_enqueued_with`.

6. **Dashboard**: mount Mission Control Jobs if enabled in project.

## Quick Commands

```bash
mise exec -- bin/rails solid_queue:install  # if missing
mise exec -- bin/jobs  # when binstub exists
```

## Anti-Patterns

- Long blocking work in web requests
- Storing huge blobs in job arguments

## See Also

- **rails-performance**
- **rails-caching**
