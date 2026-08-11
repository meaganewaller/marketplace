---
name: rails-background-jobs
description: This skill should be used when the user asks to "run this in the background", "create a job", "send this email asynchronously", "add a recurring task", "make a job idempotent", "configure retries", or mentions Active Job, Solid Queue, perform_later, or a jobs dashboard.
---

# Rails Background Jobs

Run async work through Active Job with Solid Queue in development and production.

## When to Use This Skill

- New jobs
- Recurring tasks
- Job idempotency and retries

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
