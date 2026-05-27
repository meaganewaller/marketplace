---
name: rails-routing
description: Rails routing: REST, resources, scopes, concerns, shallow routes, and route helpers. Use when designing URLs or debugging `routes.rb`.
---

# Rails Routing

Design clear, RESTful routes with Rails 8 routing features.

## When to Use This Skill

- Adding resources or member/collection routes
- API-only route namespaces
- Debugging `No route matches` errors

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Prefer resources** over ad-hoc routes; use `only:` / `except:` to trim surface.

2. **Namespaces** for admin/API: `namespace :admin do resources :users end`.

3. **Concerns** in `routes.rb` for shared route groups.

4. **Shallow nesting** when only child IDs need parent in URL.

5. **Inspect**:

```bash
mise exec -- bin/rails routes -g users
mise exec -- bin/rails routes --expanded
```

## Quick Commands

```bash
mise exec -- bin/rails routes
mise exec -- bin/rails routes -c users
```

## Anti-Patterns

- Fat `routes.rb` without partials (`draw` modules in Rails 8+)
- Non-REST RPC-style POST endpoints when PUT/PATCH fits

## See Also

- **rails-controllers**
- **rails-api-development**
