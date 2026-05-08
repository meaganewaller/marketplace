# Cloud Providers Reference

Covers GCP Secret Manager, Azure Key Vault, Doppler, and HashiCorp Vault.

## GCP Secret Manager

```toml
[providers]
gcp = { type = "gcp-sm", project = "my-gcp-project" }

[secrets]
DATABASE_URL = { provider = "gcp", value = "database-url" }
# Fetches: projects/my-gcp-project/secrets/database-url/versions/latest
```

### Authentication

```bash
# Application Default Credentials (local dev)
gcloud auth application-default login

# Service account (CI/CD)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
```

### Required IAM Role

```text
roles/secretmanager.secretAccessor
```

Scoped to: `projects/my-gcp-project/secrets/*`

### Create Secrets

```bash
echo -n "postgresql://prod.example.com/db" | \
  gcloud secrets create database-url --data-file=-
```

---

## Azure Key Vault

```toml
[providers]
azure = { type = "azure-sm", vault = "my-key-vault" }

[secrets]
DATABASE_URL = { provider = "azure", value = "database-url" }
```

### Authentication

```bash
az login  # Interactive (local dev)
# Or: AZURE_CLIENT_ID + AZURE_CLIENT_SECRET + AZURE_TENANT_ID (CI/CD)
```

### Required Role

`Key Vault Secrets User` on the vault resource.

### Create Secrets

```bash
az keyvault secret set \
  --vault-name my-key-vault \
  --name database-url \
  --value "postgresql://prod.example.com/db"
```

---

## Doppler

Doppler is a developer-friendly secrets platform with a web UI, CLI, and team access controls.

```toml
[providers]
doppler = { type = "doppler", project = "my-app", config = "dev" }

[secrets]
DATABASE_URL = { provider = "doppler", value = "DATABASE_URL" }
```

### Authentication

```bash
doppler login       # Interactive
doppler setup       # Select project and config
```

### Service Token (CI/CD)

```bash
export DOPPLER_TOKEN="dp.st.dev.xxxx"
```

### Create Secrets

Via Doppler dashboard or CLI:

```bash
doppler secrets set DATABASE_URL "postgresql://localhost/mydb"
```

---

## HashiCorp Vault

Self-hosted or HCP Vault. Best for multi-cloud environments requiring centralized access control.

```toml
[providers]
vault = { type = "vault", address = "https://vault.example.com:8200", mount = "secret" }

[secrets]
DATABASE_URL = { provider = "vault", value = "myapp/database" }
# Fetches: secret/data/myapp/database → .data.value
```

### Authentication Methods

```bash
# Token (simplest)
export VAULT_TOKEN="hvs.xxxxx"

# AppRole (CI/CD)
export VAULT_ROLE_ID="xxx"
export VAULT_SECRET_ID="xxx"
```

### Write a Secret

```bash
vault kv put secret/myapp/database value="postgresql://prod.example.com/db"
```

### Required Policy

```hcl
path "secret/data/myapp/*" {
  capabilities = ["read", "list"]
}
```

## Choosing Between Cloud Providers

| If you already use... | Use |
|-----------------------|-----|
| GCP for infrastructure | GCP Secret Manager |
| Azure for infrastructure | Azure Key Vault |
| No cloud preference, want simple UI | Doppler |
| Multi-cloud or advanced features needed | HashiCorp Vault |
