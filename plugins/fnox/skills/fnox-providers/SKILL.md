---
name: fnox-providers
description: 'Guides fnox provider selection and setup — age encryption, AWS (Parameter Store and Secrets Manager), 1Password, Bitwarden, GCP, Azure, Doppler, Vault, and local options. Triggers on: "set up fnox provider", "fnox age", "fnox aws", "fnox 1password", "which fnox provider", "configure fnox provider", "fnox encryption", "add provider to fnox".'
---

# Fnox Providers

Fnox supports two fundamental storage modes, each suited to different needs:

- **Encrypted inline**: Ciphertext lives in `fnox.toml` (safe to commit to git)
- **Remote reference**: `fnox.toml` stores only a key name; the value lives in a cloud service

## When to Use This Skill

Use this skill when:

- Choosing which provider to use for a new project
- Setting up age encryption for the first time
- Configuring AWS Secrets Manager or Parameter Store
- Integrating with an existing 1Password, Bitwarden, or Vault setup
- Mixing providers across environments (dev vs production)
- Adding a new team member to an age-encrypted project

## When NOT to Use This Skill

- Configuring fnox.toml structure, profiles, or hierarchical config — use `fnox-configuration`
- Security audit of an existing setup — use `fnox-security`
- General AWS IAM or 1Password account management (outside fnox)

## Provider Selection Guide

| Use Case | Recommended Provider |
|----------|---------------------|
| Solo dev / open source | age (free, offline, SSH key support) |
| Small team, secrets in git | age (multi-recipient) |
| Team already using 1Password | 1Password |
| AWS production workloads | AWS Secrets Manager |
| GCP production workloads | GCP Secret Manager |
| Azure production workloads | Azure Key Vault |
| Self-hosted / multi-cloud | HashiCorp Vault |
| Developer-friendly SaaS | Doppler |
| Local machine only | OS Keychain |

## Feature Comparison

| Feature | age | AWS SM | 1Password | Vault |
|---------|-----|--------|-----------|-------|
| Offline | Yes | No | No | No |
| Secrets in git | Yes | No | No | No |
| Free | Yes | Paid | Paid | Self-hosted |
| Audit logs | No | Yes | Yes | Yes |
| Access control | No | IAM | Vaults | Policies |
| Auto-rotation | No | Yes | No | Yes |
| Team-friendly | Yes | Yes | Yes | Yes |

## Quick Setup by Provider

### Age (Most Common for Dev)

```toml
[providers]
age = { type = "age", recipients = ["<your-age-public-key>"] }

[secrets]
DATABASE_URL = { provider = "age", value = "<run: fnox set DATABASE_URL '...' --provider age>" }
```

One-time setup:

```bash
age-keygen -o ~/.config/fnox/age.txt
export FNOX_AGE_KEY=$(grep "AGE-SECRET-KEY" ~/.config/fnox/age.txt)
```

### AWS Secrets Manager

```toml
[providers]
aws = { type = "aws-sm", region = "us-east-1", prefix = "myapp/" }

[secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
```

### 1Password

```toml
[providers]
onepass = { type = "1password", vault = "Development" }

[secrets]
DATABASE_URL = { provider = "onepass", value = "Database" }
```

## Mixing Providers (Dev + Production)

```toml
# Dev: age encryption in git
[providers]
age = { type = "age", recipients = ["<age-recipient>"] }

[secrets]
DATABASE_URL = { provider = "age", value = "<encrypted-value>" }

# Production: AWS Secrets Manager
[profiles.production.providers]
aws = { type = "aws-sm", region = "us-east-1" }

[profiles.production.secrets]
DATABASE_URL = { provider = "aws", value = "prod/database-url" }
```

## Progressive Disclosure

For detailed setup instructions for each provider category:

- **Age encryption** → Read `references/age.md`
- **AWS (Parameter Store + Secrets Manager)** → Read `references/aws.md`
- **GCP, Azure, Doppler, Vault** → Read `references/cloud.md`
- **1Password, Bitwarden, Infisical** → Read `references/password-managers.md`
