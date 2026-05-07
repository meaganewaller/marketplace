# Age Provider Reference

Age is the recommended provider for development secrets and open source projects. Secrets are encrypted inline in `fnox.toml` — safe to commit to git.

## Why Age

- Free, offline, no external services
- Supports SSH keys you already have (ed25519, rsa)
- Multi-recipient: encrypt once, multiple people can decrypt
- Secrets live in git with the code

## Installation

```bash
brew install age        # macOS
sudo apt install age    # Ubuntu/Debian
```

## One-Time Key Setup

### Option A: Generate an Age Key

```bash
mkdir -p ~/.config/fnox
age-keygen -o ~/.config/fnox/age.txt
# Output includes: public key: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2el...
```

Set the decryption key in your shell profile:

```bash
echo 'export FNOX_AGE_KEY=$(grep "AGE-SECRET-KEY" ~/.config/fnox/age.txt)' >> ~/.zshrc
```

### Option B: Use an Existing SSH Key (No New Key Needed)

```bash
# Use your SSH public key directly as the recipient
cat ~/.ssh/id_ed25519.pub

# Point fnox to your private key for decryption
echo 'export FNOX_AGE_KEY_FILE=~/.ssh/id_ed25519' >> ~/.zshrc
```

Supported SSH key types: ed25519 (recommended), rsa (2048-bit minimum).

Password-protected SSH keys are NOT supported — create an unencrypted copy if needed.

## Configure fnox.toml

```toml
[providers]
age = { type = "age", recipients = ["<your-public-key-here>"] }
```

## Encrypt a Secret

```bash
fnox set DATABASE_URL "postgresql://localhost/mydb" --provider age
```

This writes an encrypted value into `fnox.toml`:

```toml
[secrets]
DATABASE_URL = { provider = "age", value = "YWdlLWVuY3J5cHRpb24..." }
```

Commit `fnox.toml` — the encrypted value is safe.

## Team Setup: Multiple Recipients

Each person who needs to decrypt must be a recipient:

```toml
[providers.age]
type = "age"
recipients = [
  "<alice-ssh-ed25519-pubkey>",   # alice
  "<bob-ssh-ed25519-pubkey>",     # bob
  "<ci-bot-age-pubkey>"           # ci-bot
]
```

After adding a new recipient, re-encrypt all secrets:

```bash
fnox reencrypt -p age
```

## CI/CD: GitHub Actions

Add a dedicated age key for CI:

```bash
age-keygen -o ci-age.txt
# Add ci-age.txt public key to fnox.toml recipients
# Re-encrypt: fnox reencrypt -p age
```

Store the private key in GitHub Secrets as `FNOX_AGE_KEY`, then:

```yaml
- name: Run with secrets
  env:
    FNOX_AGE_KEY: ${{ secrets.FNOX_AGE_KEY }}
  run: fnox exec -- npm test
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "no identity matched any of the recipients" | Your key is not in recipients | Add public key to `fnox.toml`, run `fnox reencrypt` |
| "failed to decrypt" | `FNOX_AGE_KEY` not set | Export the key variable |
| SSH key not working | Password-protected key | Create unencrypted copy |
