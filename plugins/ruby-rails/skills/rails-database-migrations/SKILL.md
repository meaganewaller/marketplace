---
name: rails-database-migrations
description: This skill should be used when the user asks to "add a column", "create a migration", "rename a table", "add an index", "backfill data", "roll back a migration", "seed the database", or asks about schema.rb vs structure.sql or multiple databases. For model-level associations and validations, use rails-activerecord.
---

# Rails Database Migrations

Ship safe, reversible migrations with zero-downtime awareness when needed.

## When to Use This Skill

- New migrations
- Backfilling data
- Multiple databases / replicas

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
