---
name: rails-controllers
description: Rails controllers: strong parameters, filters, respond_to, streaming, and HTTP semantics. Use when implementing request handling.
---

# Rails Controllers

Keep controllers thin; push domain logic to models, services, or jobs.

## When to Use This Skill

- New controller actions
- Strong params and authorization hooks
- Turbo Stream responses

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Strong parameters** — always permit explicitly:

```ruby
params.expect(user: [:name, :email])
```

1. **Before actions** for auth and setup; avoid business rules in filters.

2. **respond_to** / `respond_to do |format|` for HTML/Turbo/JSON.

3. **Status codes**: `head :no_content`, `render :show, status: :created`.

4. **Service objects** when an action exceeds ~15 lines or has many branches.

## Quick Commands

```bash
mise exec -- bin/rails generate controller Posts index
mise exec -- bundle exec rubocop app/controllers
```

## Anti-Patterns

- Mass assignment without strong params
- N+1 queries in index without `includes`
- Instance variables for non-view side effects

## See Also

- **rails-routing**
- **rails-hotwire-turbo**
