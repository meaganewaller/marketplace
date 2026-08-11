---
name: rails-controllers
description: This skill should be used when the user asks to "add a controller action", "fix strong parameters", "add a before_action", "return the right HTTP status", "respond with a Turbo Stream", or "move logic out of the controller". Covers filters, respond_to, streaming, and request handling.
---

# Rails Controllers

Keep controllers thin; push domain logic to models, services, or jobs.

## When to Use This Skill

- New controller actions
- Strong params and authorization hooks
- Turbo Stream responses

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
