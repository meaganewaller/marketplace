---
name: rails-authentication
description: This skill should be used when the user asks to "add login", "set up authentication", "run the Rails 8 auth generator", "add password reset", "secure sessions", "add permissions", or "restrict this action to admins". Covers has_secure_password, session security, and authorization with Pundit or Action Policy.
---

# Rails Authentication

Implement auth with Rails 8 built-in generator or established gems — consistently.

## When to Use This Skill

- New auth flow
- Session security
- Authorization rules

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
