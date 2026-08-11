---
name: rails-hotwire-turbo
description: This skill should be used when the user asks to "add a Turbo Frame", "update part of the page without a reload", "broadcast a Turbo Stream", "make this form submit without a full refresh", or mentions Turbo Drive, lazy-loaded frames, or turbo_stream responses. For client-side behavior written as Stimulus controllers, use rails-stimulus-javascript.
---

# Hotwire Turbo

Use Turbo to minimize custom JavaScript while keeping snappy navigation.

## When to Use This Skill

- Turbo Drive full-page navigation
- Turbo Frames for partial updates
- Turbo Streams for server-pushed DOM changes

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

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
