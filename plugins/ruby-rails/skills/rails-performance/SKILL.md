---
name: rails-performance
description: This skill should be used when the user asks "why is this page slow", "fix an N+1 query", "add a missing index", "profile this request", "reduce memory bloat", or mentions Bullet, rack-mini-profiler, or strict loading. For adding caching once the cause is understood, use rails-caching.
---

# Rails Performance

Find and fix hotspots with measurement-first workflow.

## When to Use This Skill

- N+1 queries
- Slow requests
- Memory bloat

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
