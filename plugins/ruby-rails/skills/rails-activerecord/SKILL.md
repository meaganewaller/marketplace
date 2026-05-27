---
name: rails-activerecord
description: Active Record: models, associations, validations, callbacks, scopes, and query interfaces. Use when working with persistence layer.
---

# Active Record

Model data with clear associations, validations, and query objects.

## When to Use This Skill

- Associations and validations
- Scopes and `where` chains
- Counter caches and touch

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

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
