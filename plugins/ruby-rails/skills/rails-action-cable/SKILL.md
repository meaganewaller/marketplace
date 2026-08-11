---
name: rails-action-cable
description: This skill should be used when the user asks to "add real-time updates", "set up Action Cable", "create a channel", "broadcast changes to the browser", "push updates without polling", or mentions WebSockets, Solid Cable, or broadcasting from a model. Covers channels, subscriptions, connection authentication, and Turbo Stream broadcasts.
---

# Action Cable and Realtime

Use Solid Cable and Turbo Streams before custom WebSocket code.

## When to Use This Skill

- Channels and subscriptions
- Broadcasting model updates
- Connection authentication

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Solid Cable** (Rails 8) backs Action Cable in production without Redis when configured.

2. **Channels** authenticate in `Connection` — same session/cookie as app.

3. **Turbo Streams** `broadcast_append_to @post` for model-driven updates.

4. **Test** with `ActionCable::Channel::TestCase` where valuable.

## Quick Commands

```bash
mise exec -- bin/rails generate channel Notifications
mise exec -- bin/rails solid_cable:install  # if needed
```

## Anti-Patterns

- Broadcasting sensitive data to unauthenticated streams
- High-frequency updates without debouncing

## See Also

- **rails-hotwire-turbo**
