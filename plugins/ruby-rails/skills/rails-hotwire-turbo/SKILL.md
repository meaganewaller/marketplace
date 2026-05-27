---
name: rails-hotwire-turbo
description: Hotwire Turbo Drive, Frames, and Streams for Rails 8 HTML apps. Use when building interactive pages without a heavy SPA.
---

# Hotwire Turbo

Use Turbo to minimize custom JavaScript while keeping snappy navigation.

## When to Use This Skill

- Turbo Drive full-page navigation
- Turbo Frames for partial updates
- Turbo Streams for server-pushed DOM changes

## Defaults (This Plugin)

- **Toolchain**: mise — not rbenv, rvm, or asdf directly
- **Ruby**: 4.0.0+ unless the project pins otherwise
- **Rails**: 8+ conventions and generators when applicable
- **Execution**: Prefer `mise exec --`, `bin/rails`, `bin/rspec`, and `bundle exec`

## Core Guidance

1. **Drive** enabled by default — use `data-turbo="false"` sparingly.

2. **Frames**: `turbo_frame_tag` for isolating forms and lists; target frame in links/forms.

3. **Streams**: `turbo_stream.update` in controller or `broadcast_append_to` for live updates.

4. **Redirects** after mutations with 303 See Other for Turbo compatibility.

5. **Caching**: Fragment cache keys must include all dependencies.

## Quick Commands

```bash
mise exec -- bin/rails turbo:install  # if adding to older app
# Inspect turbo in browser devtools Network (text/vnd.turbo-stream.html)
```

## Anti-Patterns

- Replacing all forms with Stimulus when Turbo Frames suffice
- Missing `dom_id` in stream targets

## See Also

- **rails-stimulus-javascript**
- **rails-view-layer**
