#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Configuration (override via environment variables)
# ============================================================================
PENDING_MARKERS_DIR="${PENDING_MARKERS_DIR:-$HOME/.claude/decision-journal-pending}"

# ============================================================================
# Cleanup: remove old markers (>24 hours)
# ============================================================================
if [[ -d "$PENDING_MARKERS_DIR" ]]; then
	find "$PENDING_MARKERS_DIR" -name "*.json" -mmin +1440 -delete 2>/dev/null || true
fi

echo '{"ok":true}'
exit 0
