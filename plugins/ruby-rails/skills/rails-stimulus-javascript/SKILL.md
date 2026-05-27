---
name: rails-stimulus-javascript
description: Stimulus controllers, import maps, and modest JavaScript in Rails 8. Use when adding client behavior.
---

# Stimulus and Import Maps

Add small, cohesive Stimulus controllers; avoid SPA frameworks unless required.

## When to Use This Skill

- New Stimulus controllers
- importmap pins
- JS organization under `app/javascript`

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Generators**: `bin/rails generate stimulus hello`.

2. **Targets and values** API for DOM binding; keep controllers under ~100 lines.

3. **importmap-pin** gems instead of npm when possible for Rails-default stack.

4. **Testing**: System tests for critical interactions; unit test pure functions if extracted.

5. **Avoid** duplicating Turbo responsibilities (navigation, form submit) in Stimulus.

## Quick Commands

```bash
mise exec -- bin/rails stimulus:manifest:update
mise exec -- bin/importmap json
```

## Anti-Patterns

- Large React/Vue bundles without team commitment
- Direct DOM manipulation outside Stimulus lifecycle

## See Also

- **rails-hotwire-turbo**
