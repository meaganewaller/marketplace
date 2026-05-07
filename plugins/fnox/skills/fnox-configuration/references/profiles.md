# Profiles Reference

Profiles let you manage secrets for different environments (dev, staging, production) in a single `fnox.toml`.

## Basic Profile Structure

```toml
# Default (development) secrets
[providers]
age = { type = "age", recipients = ["<age-recipient>"] }

[secrets]
API_URL = { default = "http://localhost:3000" }
DATABASE_URL = { provider = "age", value = "<encrypted-dev-value>" }
LOG_LEVEL = { default = "info" }

# Staging overrides
[profiles.staging.secrets]
API_URL = { default = "https://staging.example.com" }
DATABASE_URL = { provider = "age", value = "<encrypted-staging-value>" }

# Production with different provider
[profiles.production.providers]
aws = { type = "aws-sm", region = "us-east-1" }

[profiles.production.secrets]
API_URL = { default = "https://api.example.com" }
DATABASE_URL = { provider = "aws", value = "prod/database-url" }
LOG_LEVEL = { default = "warn" }
```

## Profile Inheritance

Profiles inherit all top-level secrets. Define only the overrides:

```toml
[secrets]
LOG_LEVEL = { default = "info" }      # All profiles inherit this
API_TIMEOUT = { default = "30" }      # All profiles inherit this
DATABASE_URL = { provider = "age", value = "<encrypted-dev-value>" }

[profiles.production.secrets]
DATABASE_URL = { provider = "aws", value = "prod/db" }   # Override
LOG_LEVEL = { default = "warn" }                         # Override
# API_TIMEOUT still inherited as "30"
```

## Using Profiles

### Via mise (preferred)

```toml
# mise.toml
[env]
_.fnox-env = { tools = true, profile = "production" }
```

Or with mise environments:

```bash
MISE_ENV=production mise exec -- ./deploy.sh
```

### Via CLI

```bash
fnox exec --profile production -- ./deploy.sh
fnox get DATABASE_URL --profile staging
```

### Via environment variable

```bash
export FNOX_PROFILE=staging
fnox exec -- node server.js
```

## Profile-Specific Providers

```toml
# Dev uses age encryption
[providers]
age = { type = "age", recipients = ["<age-recipient>"] }

# Production uses AWS
[profiles.production.providers]
aws = { type = "aws-sm", region = "us-east-1", prefix = "myapp/" }

[profiles.production.secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
```

## Bootstrap: Provider Config Referencing Secrets

Provider configuration properties can reference other secrets using `{ secret = "NAME" }`.
This is useful when provider credentials are themselves stored as secrets.

```toml
[providers.vault]
type = "vault"
address = "http://vault.example.com:8200"
# References the VAULT_TOKEN entry from [secrets] below
vault_token = { secret = "V_TOK" }

[secrets]
V_TOK = { provider = "age", value = "<encrypted-token-value>" }
DATABASE_URL = { provider = "vault", value = "database/creds/myapp" }
```

Resolution order: `[secrets]` entries first, then environment variables.
Fnox detects and errors on circular dependencies.

## List Profiles

```bash
fnox profiles
# default (active)
# staging
# production
```

## Common Patterns

### Multi-region production

```toml
[profiles.production-us.providers]
aws = { type = "aws-sm", region = "us-east-1" }

[profiles.production-eu.providers]
aws = { type = "aws-sm", region = "eu-west-1" }
```

### Per-developer profiles

```toml
[profiles.alice.secrets]
DATABASE_URL = { default = "postgresql://localhost/alice_db" }

[profiles.bob.secrets]
DATABASE_URL = { default = "postgresql://localhost/bob_db" }
```

```bash
export FNOX_PROFILE=alice
fnox exec -- npm start
```

### CI/CD

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy-production:
    steps:
      - run: fnox exec --profile production -- ./deploy.sh
```
