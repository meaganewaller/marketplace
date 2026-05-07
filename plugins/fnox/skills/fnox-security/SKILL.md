---
name: fnox-security
description: Security best practices for fnox — key rotation, gitignore rules, CI/CD secret handling, access control, missing-secret enforcement, and avoiding common mistakes. Triggers on: "fnox security", "rotate fnox keys", "fnox gitignore", "fnox ci secrets", "fnox key rotation", "fnox access control", "fnox reencrypt", "secure fnox setup", "fnox best practices".
---

# Fnox Security Best Practices

## When to Use This Skill

Use this skill when:

- Reviewing or improving the security posture of an fnox setup
- Setting up key rotation policies
- Configuring CI/CD to handle secrets safely
- Adding or removing team member access
- Enforcing strict missing-secret behavior in production
- Auditing fnox.toml before committing

## When NOT to Use This Skill

- Initial provider setup — use `fnox-providers`
- fnox.toml structure or profiles — use `fnox-configuration`
- General cloud provider IAM setup outside fnox

## The Golden Rules

1. **Never commit `fnox.local.toml`** — always gitignore it
2. **Never store plaintext secrets** — always encrypt before committing
3. **Use service accounts in CI/CD** — not personal tokens
4. **Principle of least privilege** — scope IAM roles and vault access tightly
5. **Rotate keys periodically** — especially after team member departures

## Gitignore Rules

Always add to `.gitignore`:

```text
fnox.local.toml
.fnox.local.toml
```

Commit `fnox.toml` — encrypted values are safe. Never commit the local override file.

Provide a `fnox.local.toml.example` (committed) showing the structure without real values:

```toml
# fnox.local.toml.example — copy to fnox.local.toml and fill in your values
[secrets]
DATABASE_URL = { default = "postgresql://localhost/<your-db-name>" }
```

## Key Rotation

### Age Key Rotation

When rotating age keys (e.g., after a team member leaves):

```bash
# 1. Remove departing member from recipients in fnox.toml
# 2. Re-encrypt all secrets with remaining recipients
fnox reencrypt -p age

# Re-encrypt a specific profile
fnox reencrypt -p age -P production -f

# Preview without writing
fnox reencrypt -p age --dry-run
```

### Remote Provider Rotation

For cloud providers (AWS SM, 1Password, etc.), rotate secrets directly in the provider. Fnox only stores references — no re-encryption needed for remote secrets.

## Missing-Secret Enforcement

Use `if_missing = "error"` on required secrets to prevent silent failures:

```toml
# Required secrets must exist or the command fails
[secrets]
DATABASE_URL = { provider = "aws", value = "database-url", if_missing = "error" }

# Optional monitoring secrets (continue without them)
SENTRY_DSN = { provider = "aws", value = "sentry-dsn", if_missing = "ignore" }
```

Set a strict default at the top level for production:

```toml
if_missing = "error"  # All secrets must resolve

[secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
OPTIONAL_FEATURE = { default = "false", if_missing = "ignore" }  # Override
```

In CI/CD, control via environment variable:

```yaml
# Fail fast on missing secrets in production deploys
- run: fnox exec --profile production -- ./deploy.sh
  env:
    FNOX_IF_MISSING: error

# Be lenient for forked PRs that lack secrets
- run: fnox exec -- npm test
  env:
    FNOX_IF_MISSING: ignore
```

## CI/CD Security Patterns

### Age in GitHub Actions

```yaml
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v3
      - name: Run tests
        env:
          FNOX_AGE_KEY: ${{ secrets.FNOX_AGE_KEY }}
        run: fnox exec -- npm test
```

Never print secrets or pass them as arguments — fnox injects them as environment variables.

### Remote Providers in CI

Prefer IAM roles over static credentials when possible:

```yaml
# AWS: Use OIDC federation (no stored credentials)
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/github-actions
    aws-region: us-east-1

- run: fnox exec --profile production -- ./deploy.sh
```

## Access Control Checklist

### Age-Encrypted Secrets

- [ ] Only active team members listed as recipients
- [ ] CI has its own dedicated age key
- [ ] Departed team members removed and secrets re-encrypted
- [ ] Age private keys stored securely (not in `.env` committed to git)

### Cloud Provider Secrets

- [ ] IAM roles scoped to minimum required paths (e.g., `myapp/*` not `*`)
- [ ] Service accounts are per-environment (dev, staging, prod)
- [ ] Audit logs enabled and reviewed periodically
- [ ] Rotation policies configured for sensitive credentials

## Scanning Before Commit

Run `fnox scan` to detect any plaintext secrets accidentally added:

```bash
fnox scan          # Scan fnox.toml for unencrypted values
fnox doctor        # Check overall configuration health
fnox check         # Verify all secrets can be resolved
```

## Common Mistakes

| Mistake | Risk | Fix |
|---------|------|-----|
| Committing `fnox.local.toml` | Personal overrides exposed | Add to `.gitignore` immediately |
| Hardcoded `default = "real-value"` | Plaintext secret in git | Use a provider, not `default` for real secrets |
| Single age key for whole team | Tight coupling, hard offboarding | Use per-person recipients |
| Same CI key across environments | Dev key can access prod | Separate CI keys per environment |
| No `if_missing = "error"` on required secrets | Silent failures in prod | Mark critical secrets as `error` |
| Personal tokens in CI | Token expiry breaks CI | Use service accounts / machine identities |
