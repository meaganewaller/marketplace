---
name: rails-authentication
description: Rails 8 authentication generator, sessions, and authorization patterns (Pundit, Action Policy). Use when adding login or permissions.
---

# Rails Authentication

Implement auth with Rails 8 built-in generator or established gems — consistently.

## When to Use This Skill

- New auth flow
- Session security
- Authorization rules

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Rails 8 generator**: `bin/rails generate authentication` for session-based starter.

2. **Passwords**: `has_secure_password` with bcrypt cost tuned in test.

3. **Sessions**: Secure, HttpOnly, SameSite cookies; rotate session on login.

4. **Authorization** separate from authentication — Pundit policies or Action Policy rules.

5. **Test** sign-in helpers in integration tests.

## Quick Commands

```bash
mise exec -- bin/rails generate authentication
mise exec -- bin/rails db:migrate
```

## Anti-Patterns

- Rolling custom crypto
- Storing passwords in plain text
- Authorization in views only

## See Also

- **rails-security**
