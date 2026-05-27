---
name: rails-security
description: Rails security: OWASP, CSRF, SQL injection, XSS, mass assignment, headers. Use when reviewing security or hardening apps.
---

# Rails Security

Apply Rails security defaults and audit common footguns.

## When to Use This Skill

- Security review
- Brakeman output
- Content Security Policy

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Brakeman**: `bundle exec brakeman` in CI.

2. **CSRF** enabled for HTML; API uses token or OAuth appropriately.

3. **SQL**: Always bind parameters; sanitize dynamic table/column names.

4. **XSS**: Use `sanitize` / avoid `html_safe` on user input.

5. **Headers**: `config.force_ssl` in production; configure CSP in `content_security_policy.rb`.

6. **Dependencies**: `bundle audit` or GitHub Dependabot.

## Quick Commands

```bash
mise exec -- bundle exec brakeman -q
mise exec -- bundle exec bundler-audit check --update
```

## Anti-Patterns

- `skip_before_action :verify_authenticity_token` without alternative
- Open redirects with user params

## See Also

- **rails-authentication**
- **rails-controllers**
