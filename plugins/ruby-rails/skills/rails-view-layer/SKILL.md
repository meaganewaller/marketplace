---
name: rails-view-layer
description: This skill should be used when the user asks to "render a partial", "build a ViewComponent", "add a layout", "use content_for", "build a form", "add a view helper", or "translate this view with I18n". Covers ERB, presenters, and server-rendered UI.
---

# Rails View Layer

Compose views with partials, components, and clear locals contracts.

## When to Use This Skill

- Partials vs ViewComponent
- Layouts and content_for
- Form builders

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
