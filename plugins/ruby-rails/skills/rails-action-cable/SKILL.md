---
name: rails-action-cable
description: Action Cable, Solid Cable, and Turbo Streams broadcasts. Use for WebSockets and live UI.
---

# Action Cable and Realtime

Use Solid Cable and Turbo Streams before custom WebSocket code.

## When to Use This Skill

- Channels and subscriptions
- Broadcasting model updates
- Connection authentication

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

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
