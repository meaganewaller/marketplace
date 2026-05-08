# Password Manager Providers Reference

Covers 1Password, Bitwarden, and Infisical integration.

## 1Password

Integrates with 1Password via the `op` CLI. Best for teams already using 1Password.

```toml
[providers]
age = { type = "age", recipients = ["<age-recipient>"] }
onepass = { type = "1password", vault = "Development" }

[secrets]
OP_SERVICE_ACCOUNT_TOKEN = { provider = "age", value = "<encrypted-token>" }
DATABASE_URL = { provider = "onepass", value = "Database" }
```

### Prerequisites

```bash
brew install 1password-cli  # macOS
```

Create a **service account** in 1Password Settings → Integrations → Service Accounts. Copy the token (starts with `ops_`).

Store the token encrypted in fnox:

```bash
fnox set OP_SERVICE_ACCOUNT_TOKEN "ops_YOUR_TOKEN" --provider age
```

Each session, bootstrap it:

```bash
export OP_SERVICE_ACCOUNT_TOKEN=$(fnox get OP_SERVICE_ACCOUNT_TOKEN)
```

### Reference Formats

```toml
[secrets]
# Item name (gets password field)
MY_SECRET = { provider = "onepass", value = "My Item" }

# Item name + specific field
DB_USER = { provider = "onepass", value = "Database/username" }

# Full op:// URI
API_KEY = { provider = "onepass", value = "op://Development/Stripe/credential" }
```

### Best Practices

- Always use service accounts, not personal tokens
- One service account per environment (dev, staging, prod)
- Grant minimal vault access per service account
- Store service account token encrypted with age

---

## Bitwarden

Integrates via the Bitwarden Secrets Manager (`bws` CLI). Suitable for teams preferring open source or self-hosting.

```toml
[providers]
bw = { type = "bitwarden-sm" }

[secrets]
DATABASE_URL = { provider = "bw", value = "<secret-uuid>" }
```

### Authentication

```bash
export BWS_ACCESS_TOKEN="0.SERVICE_ACCOUNT_ACCESS_TOKEN"
```

Generate access tokens in the Bitwarden Secrets Manager dashboard.

### Get Secret UUID

```bash
bws secret list
# Note the UUID of the secret you want to reference
```

---

## Infisical

Modern open source secrets manager with a developer-friendly API.

```toml
[providers]
infisical = { type = "infisical", project_id = "your-project-id", environment = "dev" }

[secrets]
DATABASE_URL = { provider = "infisical", value = "DATABASE_URL" }
```

### Authentication

```bash
export INFISICAL_TOKEN="st.machine-identity.token"
```

Or log in interactively:

```bash
infisical login
```

### Create Secrets

Via Infisical dashboard or CLI:

```bash
infisical secrets set DATABASE_URL "postgresql://localhost/mydb" \
  --projectId your-project-id --env dev
```

---

## Comparison

| Feature | 1Password | Bitwarden | Infisical |
|---------|-----------|-----------|-----------|
| Open source | No | Yes | Yes |
| Self-hostable | No | Yes | Yes |
| Mobile app | Yes | Yes | Limited |
| Audit logs | Yes | Yes | Yes |
| Price | From $7.99/user | Free tier | Free tier |
| CI/CD support | Service accounts | Access tokens | Machine identities |
