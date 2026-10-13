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

2. **Partials** declare their locals with Rails 7.1+ strict locals — a `<%# locals: (title:, count: 0) -%>` magic comment at the top — so a missing or misspelled local raises instead of rendering `nil`.

3. **Helpers** stay presentation-only; no DB queries.

4. **Forms**: `form_with` renders a normal form, and Turbo Drive submits it over `fetch`. Opt a form out of Turbo with `data: { turbo: false }`; `local: true` is a rails-ujs option and does nothing under Turbo.

5. **I18n** for user-visible strings.

## Quick Commands

```bash
mise exec -- bin/rails generate component Card title:string
mise exec -- bundle exec erb_lint --lint-all  # if configured
```

## Anti-Patterns

- SQL in views
- Heavy logic in helpers

## See Also

- **rails-hotwire-turbo**
- **rails-stimulus-javascript**
