---
name: rails-security
description: This skill should be used when the user asks to "review this for security", "run Brakeman", "fix a CSRF issue", "prevent SQL injection", "escape this output", "set a Content Security Policy", "add security headers", or "audit dependencies for CVEs". Covers OWASP issues, mass assignment, and XSS in Rails apps.
---

# Rails Security

Apply Rails security defaults and audit common footguns.

## When to Use This Skill

- Security review
- Brakeman output
- Content Security Policy

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
