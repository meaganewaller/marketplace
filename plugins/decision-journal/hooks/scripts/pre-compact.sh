#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Configuration (override via environment variables)
# ============================================================================
PENDING_MARKERS_DIR="${PENDING_MARKERS_DIR:-$HOME/.claude/decision-journal-pending}"

# ============================================================================
# Main logic
# ============================================================================
INPUT=$(cat)

# No marker directory? Nothing to capture
if [[ ! -d "$PENDING_MARKERS_DIR" ]]; then
	exit 0
fi

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

# Check for uncaptured markers for this session
UNCAPTURED_COUNT=0
for marker in "$PENDING_MARKERS_DIR"/*.json; do
	[[ -f "$marker" ]] || continue

	MARKER_SESSION=$(jq -r '.session_id // ""' "$marker" 2>/dev/null)
	CAPTURED=$(jq -r '.captured // false' "$marker" 2>/dev/null)

	if [[ "$MARKER_SESSION" == "$SESSION_ID" ]] && [[ "$CAPTURED" == "false" ]]; then
		UNCAPTURED_COUNT=$((UNCAPTURED_COUNT + 1))
	fi
done

# No uncaptured markers? Done
if ((UNCAPTURED_COUNT == 0)); then
	exit 0
fi

# Output instruction for Claude to spawn the capture agent
jq -n --argjson count "$UNCAPTURED_COUNT" '{
  systemMessage: ("Before compaction: " + ($count|tostring) + " decision marker(s) pending capture.\n\nSpawn the capture-decisions agent to analyze and document tradeoffs before context is lost:\n\nAgent(capture-decisions): Analyze pending markers and write decision journal entries")
}'
