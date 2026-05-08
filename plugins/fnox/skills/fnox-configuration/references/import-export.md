# Import / Export Reference

Fnox can import secrets from `.env` and other formats, and export them for use in other tools.

## Importing Secrets

### From a .env file

```bash
fnox import -i .env
fnox import -i .env --provider age    # encrypt during import
```

### From stdin

```bash
cat .env | fnox import
```

### From JSON / YAML / TOML

```bash
fnox import -i secrets.json json
fnox import -i secrets.yaml yaml
fnox import -i secrets.toml toml
```

Example `secrets.json`:

```json
{
  "DATABASE_URL": "postgresql://localhost/mydb",
  "API_KEY": "sk_test_abc123"
}
```

## Import Options

| Flag | Description |
|------|-------------|
| `--provider <name>` | Encrypt with this provider during import |
| `--filter <regex>` | Only import secrets matching pattern |
| `--prefix <str>` | Prepend prefix to all imported secret names |

Examples:

```bash
# Import only database secrets, encrypt with age
fnox import -i .env --filter "^DATABASE_" --provider age

# Import all secrets with a prefix
fnox import -i .env --prefix "MYAPP_" --provider age
# DATABASE_URL → MYAPP_DATABASE_URL
```

## Exporting Secrets

```bash
fnox export                           # .env format (default)
fnox export --format json
fnox export --format yaml
fnox export --format toml

fnox export > .env
fnox export --format json > secrets.json
fnox export --profile production > .env.production
```

## Migration: .env → fnox with encryption

```bash
# 1. Add age provider to fnox.toml
cat >> fnox.toml << 'EOF'
[providers.age]
type = "age"
recipients = ["age1..."]
EOF

# 2. Import and encrypt
fnox import -i .env --provider age

# 3. Verify
fnox list

# 4. Remove the plaintext file
rm .env
```

## Migration: Between Providers

```bash
# 1. Export current secrets
fnox export --profile production --format json > prod-secrets.json

# 2. Add new provider to fnox.toml
# 3. Re-import with new provider
fnox import -i prod-secrets.json json --provider age

# 4. Verify, then delete plaintext file
rm prod-secrets.json
```

## Docker / Kubernetes Integration

```bash
# Docker Compose — generate .env
fnox export > .env

# Kubernetes secret from fnox
kubectl create secret generic app-secrets \
  --from-env-file=<(fnox export)
```

## Team Onboarding

```bash
# Export a template with placeholder values
fnox export --format json > secrets.example.json
# Edit with real values, then:
fnox import -i secrets.json json --provider age
rm secrets.json
```
