---
name: hook-development
description: >-
  This skill should be used when the user asks to "create a hook", "add a
  PreToolUse hook", "add a PostToolUse hook", "validate tool use", "set up
  event-driven automation", or mentions hook events (PreToolUse, PostToolUse,
  Stop, SubagentStop, SessionStart, SessionEnd, UserPromptSubmit, PreCompact,
  Notification).
---

# Hook Development

Guidance for creating Claude Code plugin hooks.

## What Hooks Do

Hooks run in response to Claude Code events. Use them to validate operations,
enforce policies, inject context, or automate workflows.

## Configuration Location

Plugin hooks live in `hooks/hooks.json` at the plugin root:

```json
{
  "description": "Optional summary of hook purpose",
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": [],
    "Stop": []
  }
}
```

The `hooks` wrapper is required for plugin hook files.

## Hook Types

### Prompt-Based Hooks

Use LLM evaluation for context-aware decisions:

```json
{
  "type": "prompt",
  "prompt": "Evaluate if this tool use is appropriate: $TOOL_INPUT",
  "timeout": 30
}
```

Supported on: `Stop`, `SubagentStop`, `UserPromptSubmit`, `PreToolUse`.

### Command Hooks

Use bash for fast deterministic checks:

```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 60
}
```

## Portable Paths

Always reference plugin files with `${CLAUDE_PLUGIN_ROOT}`:

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/check-secrets.sh
```

Never hardcode absolute paths to the plugin directory.

## Authoring Workflow

1. Choose the event that matches the trigger (see `references/events.md`)
2. Decide prompt-based vs command-based execution
3. Add the hook entry under the correct event in `hooks/hooks.json`
4. Place scripts under `hooks/scripts/` or plugin `scripts/`
5. Test with realistic tool inputs and edge cases
6. Document hook behavior in the plugin README

## Design Guidelines

- Keep hooks fast; set explicit `timeout` values
- Fail closed for security-sensitive validation
- Return clear stderr messages when blocking an action
- Avoid duplicating logic that belongs in a skill or command
- Prefer one hook per concern rather than monolithic scripts

## Additional Resources

- **`references/events.md`** — Event types and when to use each
