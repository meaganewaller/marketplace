---
name: rails-database-migrations
description: Schema migrations, multi-database, seeds, and structure.sql vs schema.rb. Use when changing the database shape.
---

# Rails Database Migrations

Ship safe, reversible migrations with zero-downtime awareness when needed.

## When to Use This Skill

- New migrations
- Backfilling data
- Multiple databases / replicas

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **One concern per migration** — reversible when possible (`change` with reversible blocks).

2. **Strong migrations habits**: Add column → backfill → add constraint in separate deploys for large tables.

3. **Indexes**: Add concurrently on Postgres in production (`algorithm: :concurrently` + `disable_ddl_transaction!`).

4. **Run**:

```bash
mise exec -- bin/rails db:migrate
mise exec -- bin/rails db:rollback STEP=1
mise exec -- bin/rails db:prepare   # dev/CI
```

1. **Seeds** idempotent; heavy data → rake task or job.

## Quick Commands

```bash
mise exec -- bin/rails generate migration AddEmailToUsers email:string
mise exec -- bin/rails db:migrate
mise exec -- bin/rails db:seed
```

## Anti-Patterns

- Renaming columns in place on live traffic without dual-write plan
- Editing old migrations after merge

## See Also

- **rails-activerecord**
- **rails-performance**
