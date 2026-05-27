---
name: rails-caching
description: Fragment, low-level, and HTTP caching with Solid Cache (Rails 8). Use when optimizing read-heavy paths.
---

# Rails Caching

Apply caching at the right layer with clear invalidation rules.

## When to Use This Skill

- Russian doll caching
- Solid Cache config
- HTTP cache headers

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Development**: Toggle `rails dev:cache` to test caching locally.

2. **Keys**: Include locale, roles, and `updated_at` in cache keys.

3. **Solid Cache**: Default in Rails 8 — store in DB; tune `config/cache.yml`.

4. **HTTP**: `stale?`, `fresh_when` in controllers for conditional GET.

5. **Avoid** caching user-specific HTML without key segmentation.

## Quick Commands

```bash
mise exec -- bin/rails dev:cache
mise exec -- bin/rails runner 'Rails.cache.write("ping", "pong")'
```

## Anti-Patterns

- Caching nil or error responses
- Forever caches without invalidation

## See Also

- **rails-performance**
