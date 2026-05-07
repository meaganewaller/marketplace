# AWS Providers Reference

Fnox supports two AWS secret storage backends: Parameter Store (simpler, cheaper) and Secrets Manager (richer features, rotation support).

## AWS Parameter Store

Simple key-value storage. Good for config values and non-sensitive parameters.

```toml
[providers]
aws = { type = "aws-ps", region = "us-east-1", prefix = "/myapp/" }

[secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
# Fetches: /myapp/database-url
```

### IAM Permissions (Minimum)

```json
{
  "Effect": "Allow",
  "Action": ["ssm:GetParameter", "ssm:GetParameters"],
  "Resource": "arn:aws:ssm:REGION:ACCOUNT:parameter/myapp/*"
}
```

### Create Parameters

```bash
aws ssm put-parameter \
  --name "/myapp/database-url" \
  --value "postgresql://prod.example.com/db" \
  --type SecureString
```

## AWS Secrets Manager

Full-featured secret storage with rotation, versioning, and audit logs. Best for production workloads.

```toml
[providers]
aws = { type = "aws-sm", region = "us-east-1", prefix = "myapp/" }

[secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
# Fetches: myapp/database-url
```

### IAM Permissions (Minimum)

```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "secretsmanager:DescribeSecret"
  ],
  "Resource": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:myapp/*"
}
```

Note: `secretsmanager:ListSecrets` requires `"Resource": "*"` and cannot be scoped.

### Create Secrets

```bash
aws secretsmanager create-secret \
  --name "myapp/database-url" \
  --secret-string "postgresql://prod.example.com/db"
```

## AWS Credentials

Fnox uses the standard AWS credential chain. In order of precedence:

1. `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` environment variables
2. `~/.aws/credentials` file
3. IAM instance role (EC2, ECS, Lambda)
4. AWS SSO / IAM Identity Center

For local development with mise:

```toml
# mise.toml
[env]
AWS_PROFILE = "myapp-dev"
_.fnox-env = { tools = true }
```

## Dev + Production Pattern

```toml
# Development: age encryption in git (no AWS needed locally)
[providers]
age = { type = "age", recipients = ["<age-recipient>"] }

[secrets]
DATABASE_URL = { provider = "age", value = "<encrypted-value>" }

# Production: AWS Secrets Manager
[profiles.production.providers]
aws = { type = "aws-sm", region = "us-east-1", prefix = "myapp/" }

[profiles.production.secrets]
DATABASE_URL = { provider = "aws", value = "database-url" }
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `NoCredentialProviders` | No AWS credentials found | Configure `~/.aws/credentials` or set env vars |
| `AccessDeniedException` | Missing IAM permissions | Check IAM policy allows `GetSecretValue` |
| `ResourceNotFoundException` | Secret name wrong or missing | Verify name with `aws secretsmanager list-secrets` |
| `InvalidRequestException` | Secret marked for deletion | Restore or recreate the secret |
