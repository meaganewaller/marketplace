---
name: rails-view-layer
description: ERB, layouts, partials, ViewComponent, helpers, and presenters. Use when building server-rendered UI.
---

# Rails View Layer

Compose views with partials, components, and clear locals contracts.

## When to Use This Skill

- Partials vs ViewComponent
- Layouts and content_for
- Form builders

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **ViewComponent** for reusable UI with tests in `spec/components` or `test/components`.

2. **Partials** require explicit locals (Ruby 3.1+ keyword locals warning).

3. **Helpers** stay presentation-only; no DB queries.

4. **Forms**: `form_with` defaults to remote Turbo behavior — set `local: true` only when needed.

5. **I18n** for user-visible strings.

## Quick Commands

```bash
mise exec -- bin/rails generate component Card title:string
mise exec -- bundle exec erblint app/views  # if configured
```

## Anti-Patterns

- SQL in views
- Heavy logic in helpers

## See Also

- **rails-hotwire-turbo**
- **rails-stimulus-javascript**
