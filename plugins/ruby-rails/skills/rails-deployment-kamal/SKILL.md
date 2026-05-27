---
name: rails-deployment-kamal
description: Deploy Rails 8 with Kamal, Docker, and production checklist. Use when shipping or configuring production.
---

# Rails Deployment with Kamal

Deploy containerized Rails with Kamal 2 and Rails-generated Dockerfile.

## When to Use This Skill

- First Kamal deploy
- Env and secrets
- Zero-downtime deploys

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Rails 8** ships Dockerfile — customize multi-stage build.

2. **Kamal**: `config/deploy.yml` — registry, servers, env.

3. **Secrets**: Kamal secrets or 1Password; never bake into image.

4. **Solid Queue** runs in Puma plugin or separate role per `config/queue.yml`.

5. **Health check** `/up` in deploy config.

## Quick Commands

```bash
mise exec -- kamal setup
mise exec -- kamal deploy
mise exec -- kamal app logs
```

## Anti-Patterns

- Running `db:migrate` manually on one server only
- Missing asset precompile in build

## See Also

- **rails-application-boot**
