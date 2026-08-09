---
name: rails-routing
description: This skill should be used when the user asks to "add a route", "set up nested resources", "add a member or collection route", "namespace an API", "fix a No route matches error", or asks what a path helper is named. Covers REST resources, scopes, concerns, shallow nesting, and routes.rb debugging.
---

# Rails Routing

Design clear, RESTful routes with Rails 8 routing features.

## When to Use This Skill

- Adding resources or member/collection routes
- API-only route namespaces
- Debugging `No route matches` errors

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
