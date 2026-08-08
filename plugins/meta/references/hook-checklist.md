# Hook Quality Checklist

Use when validating `hooks/hooks.json` and hook scripts in a Claude Code plugin.

## Structure

- [ ] `hooks/hooks.json` exists at plugin root (when plugin declares hooks)
- [ ] Top-level `hooks` wrapper object is present (plugin format)
- [ ] Event keys use valid Claude Code event names
- [ ] Each event entry uses correct nested structure (`matcher` + `hooks` arrays)

## Configuration

- [ ] Command hooks use `${CLAUDE_PLUGIN_ROOT}` or `"$CLAUDE_PLUGIN_ROOT"` — not hardcoded absolute paths
- [ ] Referenced scripts exist relative to the plugin root
- [ ] `timeout` is set on hook entries (recommended for all hooks)
- [ ] Prompt hooks are only used on supported events (`PreToolUse`, `Stop`, `SubagentStop`, `UserPromptSubmit`)

## Scripts

- [ ] Command hook scripts are executable or invoked via `bash`
- [ ] Scripts use `set -euo pipefail` (or equivalent strict mode) when written in bash
- [ ] Scripts read hook input from stdin when applicable (JSON tool payload)
- [ ] Non-zero exit codes block actions with clear stderr messages

## Testing

- [ ] Companion `test-*.sh` scripts exist for non-trivial command hooks
- [ ] Test scripts document how to run them
- [ ] Tests cover allow and block cases plus regression scenarios

## Documentation

- [ ] Plugin README lists hooks under Components (or notes "(None yet)")
- [ ] Hook purpose is documented (in README or `hooks.json` `description`)
- [ ] Matchers are intentional (not overly broad `*` without justification)

## Severity Guide

| Severity | Examples |
| --- | --- |
| **Critical** | Missing `hooks` wrapper, broken script paths, invalid event names |
| **Warning** | Missing timeouts, hardcoded paths, no tests for complex hooks |
| **Suggestion** | Missing README entry, broad matchers, undocumented prompt hooks |
