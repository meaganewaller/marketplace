# Syncing Secrets Locally

`fnox sync` fetches secrets from remote providers (1Password, AWS Secrets Manager, etc.) and re-encrypts them with a local provider (age, AWS KMS, etc.) in `fnox.local.toml`. Subsequent loads are instant and offline.

## Why Sync?

Without sync, every directory entry calls 1Password (or another remote provider) to fetch each secret — slow and requires network.

With sync, secrets are decrypted from a local age cache with no remote calls.

## Basic Usage

```bash
# Sync all secrets to fnox.local.toml with age encryption
fnox sync --provider age --config fnox.local.toml

# Preview without writing
fnox sync --provider age --config fnox.local.toml --dry-run

# Sync specific secrets only
fnox sync --provider age --config fnox.local.toml DATABASE_URL STRIPE_KEY

# Sync only secrets from a specific source provider
fnox sync --provider age --config fnox.local.toml --source op

# Filter by regex
fnox sync --provider age --config fnox.local.toml --filter "^DB_"
```

## How It Works

1. Reads all secrets from merged config
2. Resolves each secret's plaintext from the original remote provider
3. Encrypts each value with the target provider (e.g., age)
4. Writes encrypted values as `sync` fields in `fnox.local.toml`

When resolving secrets, fnox checks for a `sync` field first — no remote call needed.

## Before and After

**`fnox.toml`** (committed — source of truth, unchanged):

```toml
[providers.op]
type = "1password"
vault = "Engineering"

[providers.age]
type = "age"
recipients = ["age1..."]

[secrets]
DATABASE_URL = { provider = "op", value = "Database/url" }
STRIPE_KEY = { provider = "op", value = "Stripe/secret-key" }
```

**`fnox.local.toml`** (gitignored — local cache after sync):

```toml
[secrets]
DATABASE_URL = { provider = "op", value = "Database/url", sync = { provider = "age", value = "YWdlLWVuY3J5cHRpb24..." } }
STRIPE_KEY = { provider = "op", value = "Stripe/secret-key", sync = { provider = "age", value = "YWdlLWVuY3J5cHRpb24..." } }
```

## Full Setup Workflow

```bash
# 1. Clone the project
git clone https://github.com/myorg/my-api && cd my-api

# 2. Gitignore local cache
echo "fnox.local.toml" >> .gitignore

# 3. Generate an age key (one-time)
age-keygen -o ~/.config/fnox/age.txt
export FNOX_AGE_KEY=$(grep "AGE-SECRET-KEY" ~/.config/fnox/age.txt)

# 4. Add your age public key to fnox.toml's providers
# (replace with your actual public key from step 3)
cat >> fnox.toml << EOF
[providers.age]
type = "age"
recipients = ["$(grep 'public key:' ~/.config/fnox/age.txt | awk '{print $NF}')"]
EOF

# 5. Sync all secrets
fnox sync --provider age --config fnox.local.toml

# 6. Done — entering the directory is now instant
```

## Refreshing After Remote Changes

```bash
fnox sync --provider age --config fnox.local.toml --force
```

`--force` skips the confirmation prompt and re-fetches from the original provider.

## YubiKey Support

If you use a YubiKey with `age-plugin-yubikey`:

```toml
[providers.age]
type = "age"
recipients = ["age1yubikey1q..."]  # YubiKey recipient
```

Sync works identically. Decryption requires the YubiKey to be plugged in.

## Always Gitignore

```text
fnox.local.toml
.fnox.local.toml
```
