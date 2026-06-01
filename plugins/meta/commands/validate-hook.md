---
description: Validate plugin hook configuration, scripts, and portable path usage
argument-hint: <plugin-path>
allowed-tools: Read, Grep, Glob, Bash
---

# Validate Hook

Static audit of a plugin's `hooks/hooks.json`, referenced scripts, and hook
conventions. Part of the **meta** plugin — pair with `/meta:hooks-eval` for
behavioral testing.

## Usage

```text
/meta:validate-hook plugins/git
/meta:validate-hook plugins/example-plugin
/meta:validate-hook plugins/meta
```

## Instructions

When invoked:

1. **Resolve target** — Use `$ARGUMENTS` as the plugin directory. If empty, ask
   which plugin to validate.

2. **Apply hook-development skill** — Load and follow
   `references/hook-checklist.md`.

3. **Locate hooks** — Read `hooks/hooks.json`. If missing, report N/A for hook
   validation (not a failure unless README claims hooks exist).

4. **Validate JSON structure** — Confirm:
   - Top-level `hooks` wrapper object exists
   - Event names are valid (`PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`,
     `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreCompact`, `Notification`)
   - Nested `matcher` and `hooks` arrays are well-formed
   - Each hook entry has `type` (`command` or `prompt`) and required fields

5. **Validate paths** — For command hooks, flag hardcoded absolute paths. Prefer
   `${CLAUDE_PLUGIN_ROOT}` or `"$CLAUDE_PLUGIN_ROOT"`. Verify referenced scripts
   exist.

6. **Validate scripts** — For each command hook script:
   - Check file exists and is readable
   - Note whether a companion `test-*.sh` exists in the same directory
   - Flag missing `timeout` values

7. **Validate prompt hooks** — Confirm prompt hooks attach only to supported
   events. Check prompts are non-empty and describe a clear allow/block decision.

8. **Report findings** — Read-only audit unless the user asks to fix issues.

## Output Format

```markdown
# Hook Validation: <plugin-name>

**Result:** PASS | PASS WITH WARNINGS | FAIL | N/A (no hooks)

## Summary
<one paragraph>

## Hooks Inventory
| Event | Matcher | Type | Script/Prompt | Timeout |
| --- | --- | --- | --- | --- |

## Critical
- issue — recommendation

## Warnings
- issue — recommendation

## Suggestions
- issue — recommendation

## Checklist
Copy hook-checklist items with ✅ / ⚠️ / ❌ per row.
```

Suggest `/meta:hooks-eval $plugin` when behavioral testing or test scripts should
be run next.
