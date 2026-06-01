# Hook Events

Quick reference for Claude Code hook events.

## PreToolUse

Runs before a tool executes. Use to block or allow tool calls.

**Good for:** dangerous command blocking, path restrictions, secret scanning.

## PostToolUse

Runs after a tool completes. Use to react to results.

**Good for:** logging, follow-up validation, metrics collection.

## Stop / SubagentStop

Runs when Claude or a subagent finishes a turn. Use to enforce completion standards.

**Good for:** checklist verification, requiring tests before stop.

## SessionStart / SessionEnd

Runs at session boundaries. Use to load or persist context.

**Good for:** project context injection, session summaries.

## UserPromptSubmit

Runs when the user submits a prompt. Use to augment or validate input.

**Good for:** adding standards reminders, blocking disallowed requests.

## PreCompact

Runs before context compaction. Use to preserve critical state.

**Good for:** saving summaries or decisions before compaction.

## Notification

Runs on notification events. Use for alerting integrations.

**Good for:** desktop notifications, external webhooks (via script).

## Choosing an Event

| Goal | Event |
| --- | --- |
| Block bad tool calls | `PreToolUse` |
| React to tool output | `PostToolUse` |
| Enforce "done" criteria | `Stop` |
| Load project context | `SessionStart` |
| Augment user prompts | `UserPromptSubmit` |

## Prompt vs Command

| Type | When |
| --- | --- |
| Prompt | Context-dependent judgment, natural language rules |
| Command | Deterministic checks, filesystem ops, fast validation |
