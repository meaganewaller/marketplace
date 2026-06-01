---
description: Validate a Claude Code plugin against structure and marketplace checklist rules
argument-hint: <plugin-path>
---

# Validate Plugin

Audit a plugin directory for Claude Code layout, manifest quality, and
marketplace registration completeness.

## Usage

```text
/meta:validate-plugin plugins/meta
/meta:validate-plugin plugins/git
/meta:validate-plugin .
```

## Instructions

When invoked:

1. **Resolve target** — Use `$ARGUMENTS` as the plugin path. If empty, look for
   `plugins/*/.claude-plugin/plugin.json` relative to the repo root or ask the
   user which plugin to validate.

2. **Apply plugin-structure skill** — Follow the validation workflow and load
   `references/marketplace-checklist.md` when the plugin is part of
   `meaganewaller-marketplace`.

3. **Inspect files** — Read `.claude-plugin/plugin.json`, `README.md`, and
   sample component files. Use Glob to discover commands, skills, agents, and
   hooks.

4. **Check registration** — When validating a marketplace plugin under
   `plugins/<name>/`, verify entries in:
   - `.claude-plugin/marketplace.json`
   - `release-please-config.json`
   - `.release-please-manifest.json`

5. **Report findings** — Produce a structured audit. Do not modify files unless
   the user explicitly asks to fix issues.

## Output Format

```markdown
# Plugin Validation: <plugin-name>

**Result:** PASS | PASS WITH WARNINGS | FAIL

## Summary
<one paragraph>

## Critical
- [ ] issue — recommendation

## Warnings
- [ ] issue — recommendation

## Suggestions
- [ ] issue — recommendation

## Checklist
| Area | Status |
| --- | --- |
| Manifest | ✅ / ⚠️ / ❌ |
| Layout | ... |
| Components | ... |
| Marketplace registration | ... |
| README | ... |
```

Mark checklist rows that do not apply as N/A (for example, marketplace
registration when auditing a non-marketplace plugin).
