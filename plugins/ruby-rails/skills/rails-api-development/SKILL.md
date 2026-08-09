---
name: rails-api-development
description: This skill should be used when the user asks to "build a JSON API", "run rails new --api", "add API versioning", "serialize this model as JSON", "add pagination to an endpoint", "configure CORS", or mentions jbuilder, blueprinter, or alba. Covers API-only apps that render no HTML.
---

# Rails API Development

Build focused API apps with clear contracts and auth.

## When to Use This Skill

- `rails new --api`
- Serializers (jbuilder, blueprinter, alba)
- Versioned routes

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Base**: `ActionController::API` — include only needed modules.

2. **Serialization** — pick one gem per project; avoid ad-hoc `to_json` on models.

3. **Errors**: Consistent JSON error envelope and HTTP status codes.

4. **Pagination**: cursor or keyset for large lists.

5. **CORS** configured in `config/initializers/cors.rb` when browser clients exist.

## Quick Commands

```bash
mise exec -- rails new api --api --database=postgresql
mise exec -- bin/rails routes -g api
```

## Anti-Patterns

- Returning 200 with error payloads
- N+1 in index endpoints

## See Also

- **rails-authentication**
- **rails-security**
