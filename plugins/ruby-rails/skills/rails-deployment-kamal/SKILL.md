---
name: rails-deployment-kamal
description: This skill should be used when the user asks to "deploy this app", "set up Kamal", "configure production secrets", "do a zero-downtime deploy", "write a Dockerfile for Rails", or "run through a production checklist". Covers Kamal, Docker, and Rails 8 production configuration.
---

# Rails Deployment with Kamal

Deploy containerized Rails with Kamal 2 and Rails-generated Dockerfile.

## When to Use This Skill

- First Kamal deploy
- Env and secrets
- Zero-downtime deploys

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
