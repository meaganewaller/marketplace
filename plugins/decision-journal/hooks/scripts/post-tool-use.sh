#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Configuration (override via environment variables)
# ============================================================================
LARGE_CHANGE_LINES="${LARGE_CHANGE_LINES:-100}"
PENDING_MARKERS_DIR="${PENDING_MARKERS_DIR:-$HOME/.claude/decision-journal-pending}"

# ============================================================================
# Main logic
# ============================================================================
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path? Not relevant
if [[ -z "$FILE" ]]; then
	exit 0
fi

# Not in a git repo? Can't diff
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	exit 0
fi

# Get lines changed (handle non-tracked files gracefully)
LINES=$(
	set +o pipefail
	git diff --shortstat HEAD -- "$FILE" 2>/dev/null | awk '{print $4}'
)

if [[ -z "$LINES" ]]; then
	exit 0
fi

# Below threshold? No marker needed
if ((LINES <= LARGE_CHANGE_LINES)); then
	exit 0
fi

# Ensure marker directory exists
mkdir -p "$PENDING_MARKERS_DIR"

# Clean up old markers if too many (>100)
MARKER_COUNT=$(find "$PENDING_MARKERS_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
if ((MARKER_COUNT > 100)); then
	find "$PENDING_MARKERS_DIR" -name "*.json" -mtime +7 -delete 2>/dev/null || true
fi

# Create marker file
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
MARKER_FILE="$PENDING_MARKERS_DIR/$(date +%s)-$(basename "$FILE").json"

jq -n \
	--arg file "$FILE" \
	--arg lines "$LINES" \
	--arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
	--arg session_id "$SESSION_ID" \
	'{
    file: $file,
    lines_changed: ($lines|tonumber),
    created_at: $timestamp,
    session_id: $session_id,
    captured: false
  }' >"$MARKER_FILE"

# Output system message to nudge the model
jq -n \
	--arg file "$FILE" \
	--arg lines "$LINES" \
	'{
  systemMessage: ("Large change detected: " + $file + " (" + $lines + " lines)\n\nA marker has been created. At session end, any tradeoff reasoning will be auto-captured.\n\nConsider noting:\n- Why you chose this approach\n- What alternatives you considered\n- When this decision should be revisited")
}'
