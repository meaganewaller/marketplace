---
name: rails-stimulus-javascript
description: This skill should be used when the user asks to "add a Stimulus controller", "add JavaScript to this page", "pin a JS package with importmap", "wire up a data-action", or asks where JS belongs under app/javascript. For server-driven page updates that need no JavaScript, use rails-hotwire-turbo.
---

# Stimulus and Import Maps

Add small, cohesive Stimulus controllers; avoid SPA frameworks unless required.

## When to Use This Skill

- New Stimulus controllers
- importmap pins
- JS organization under `app/javascript`

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
