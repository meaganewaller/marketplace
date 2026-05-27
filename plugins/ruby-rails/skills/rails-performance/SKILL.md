---
name: rails-performance
description: N+1 detection, indexing, profiling, and query optimization. Use when app is slow or queries multiply.
---

# Rails Performance

Find and fix hotspots with measurement-first workflow.

## When to Use This Skill

- N+1 queries
- Slow requests
- Memory bloat

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Bullet** gem in development for N+1 warnings.

2. **rack-mini-profiler** locally for flamegraphs when enabled.

3. **Indexes** match `WHERE`, `ORDER BY`, and foreign keys.

4. **Strict loading** (`strict_loading_by_default`) to fail fast in dev/test.

5. **Cache** after fixing query shape — see **rails-caching**.

## Quick Commands

```bash
mise exec -- bin/rails runner 'User.includes(:posts).load'
# Add bullet or prosopite per project Gemfile
```

## Anti-Patterns

- Premature caching without profiling
- `User.all` in production consoles

## See Also

- **rails-activerecord**
- **rails-caching**
