# Decision Journal

Captures tradeoffs and architectural decisions into markdown automatically, using a subagent for rich context analysis.

## Installation

```bash
/plugin install decision-journal@meaganewaller-marketplace
```

## How It Works

1. **PostToolUse (Write/Edit)**: When you make a large change (>100 lines), a lightweight marker is created
2. **PreCompact (auto)**: Before context compaction, a subagent analyzes pending markers and writes rich decision journal entries
3. **Stop**: Cleans up old markers (>24 hours)

The key insight: capture happens right before context is lost, when all the reasoning is still available.

## Configuration

Override via environment variables:

| Variable | Default | Description |
| ---------- | --------- | ------------- |
| `LARGE_CHANGE_LINES` | `100` | Line threshold for creating markers |
| `PENDING_MARKERS_DIR` | `~/.claude/decision-journal-pending` | Where markers are stored |
| `DECISION_JOURNAL_DIR` | `~/.claude/decision-journal` | Where journal entries are written |

## Journal Entry Format

The capture agent writes entries with this structure:

```markdown
---
project: my-project
branch: feature/foo
date: 2026-04-10
files: /path/to/file.ts
status: draft
---

# Decision Title

## Context
What situation led to this decision?

## Decision
What was decided?

## Alternatives Considered
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|

## Consequences
Benefits, tradeoffs, and risks.

## Revisit When
Conditions for reconsidering.
```

## Marker Format

Markers are JSON files compatible with other tools:

```json
{
  "session_id": "abc123",
  "file": "/path/to/changed/file.ts",
  "lines_changed": 150,
  "created_at": "2026-04-10T12:00:00Z",
  "captured": false
}
```

## Components

### Hooks

- **PostToolUse** (Write|Edit): Creates markers for large changes
- **PreCompact** (auto): Triggers capture agent before compaction
- **Stop**: Cleans up old markers

### Agents

- **capture-decisions**: Analyzes context and writes rich journal entries

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
