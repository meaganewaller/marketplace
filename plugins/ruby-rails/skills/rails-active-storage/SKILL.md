---
name: rails-active-storage
description: Active Storage, direct uploads, image variants, and Action Mailbox/Text. Use for files and rich text.
---

# Active Storage and Rich Text

Handle uploads and attachments with Active Storage and Action Text defaults.

## When to Use This Skill

- File uploads
- Image variants (vips/mini_magick)
- Action Text content

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Direct uploads** to S3-compatible service in production.

2. **Variants** via `has_rich_text` / `has_one_attached` with explicit prewarming in jobs for large images.

3. **Validations** on content type and size in model.

4. **GDPR**: purge attachments when records destroyed (`dependent: :purge_later`).

## Quick Commands

```bash
mise exec -- bin/rails active_storage:install
mise exec -- bin/rails db:migrate
```

## Anti-Patterns

- Serving user uploads without virus scanning when required
- Sync variant generation on request thread

## See Also

- **rails-background-jobs**
