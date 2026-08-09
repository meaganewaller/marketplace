---
name: rails-activerecord
description: This skill should be used when the user asks to "add an association", "add a validation", "write a scope", "set up has_many :through", "add a counter cache", or "use an enum", or is working with models, callbacks, or query chains. For schema changes and migration files, use rails-database-migrations; for diagnosing slow or N+1 queries, use rails-performance.
---

# Active Record

Model data with clear associations, validations, and query objects.

## When to Use This Skill

- Associations and validations
- Scopes and `where` chains
- Counter caches and touch

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Associations**: Declare `dependent:` explicitly; prefer `inverse_of` where helpful.

2. **Validations** in model; database constraints for integrity (uniqueness with concurrency).

3. **Callbacks** sparingly — prefer explicit service calls over callback chains.

4. **Query**: Use `includes`/`preload`/`eager_load` intentionally; extract complex SQL to scope classes or `app/queries`.

5. **Enums** and Rails 8 attributes API for typed attributes.

6. **Console**:

```bash
mise exec -- bin/rails console
```

## Quick Commands

```bash
mise exec -- bin/rails console
mise exec -- bin/rails dbconsole
```

## Anti-Patterns

- `default_scope` hiding data unexpectedly
- `update_column` skipping validations/callbacks without intent
- Raw SQL strings without binds

## See Also

- **rails-database-migrations**
- **rails-performance**
