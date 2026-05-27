---
name: rails-api-development
description: API-only Rails apps, JSON rendering, versioning, and pagination. Use when building HTTP APIs without HTML.
---

# Rails API Development

Build focused API apps with clear contracts and auth.

## When to Use This Skill

- `rails new --api`
- Serializers (jbuilder, blueprinter, alba)
- Versioned routes

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

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
