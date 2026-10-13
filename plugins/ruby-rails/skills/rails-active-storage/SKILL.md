---
name: rails-active-storage
description: This skill should be used when the user asks to "add file uploads", "attach an image to a model", "set up direct uploads to S3", "generate image thumbnails", "add a rich text editor", or mentions Active Storage, Action Text, Action Mailbox, variants, vips, or mini_magick.
---

# Active Storage and Rich Text

Handle uploads and attachments with Active Storage and Action Text defaults.

## When to Use This Skill

- File uploads
- Image variants (vips/mini_magick)
- Action Text content

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Direct uploads** to S3-compatible service in production.

2. **Variants** are declared on the attachment — `has_one_attached :avatar do |a| a.variant :thumb, resize_to_limit: [100, 100], preprocessed: true end`. `preprocessed: true` (Rails 7.1+) generates them in a background job after upload instead of on first request.

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
