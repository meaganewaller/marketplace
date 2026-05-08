#!/usr/bin/env bash
# Checks mise status at session start.
# - Exits silently (0) when mise is healthy and mise.toml is present
# - Prints a nudge when mise.toml is missing in the project
# - Surfaces mise doctor output when there are issues
set -euo pipefail

# Silently exit if mise is not installed — not every project uses mise
if ! command -v mise >/dev/null 2>&1; then
  exit 0
fi

PROJECT_DIR="${PWD}"

# Walk up to find a mise.toml (respects mise's own config discovery)
check_dir="$PROJECT_DIR"
found_config=false
while [[ "$check_dir" != "/" ]]; do
  if [[ -f "$check_dir/mise.toml" ]] || [[ -f "$check_dir/mise.local.toml" ]]; then
    found_config=true
    break
  fi
  check_dir="$(dirname "$check_dir")"
done

if [[ "$found_config" == "false" ]]; then
  # Only nudge if the directory looks like a code project
  if [[ -f "$PROJECT_DIR/package.json" ]] || \
     [[ -f "$PROJECT_DIR/Gemfile" ]] || \
     [[ -f "$PROJECT_DIR/pyproject.toml" ]] || \
     [[ -f "$PROJECT_DIR/Pipfile" ]] || \
     [[ -f "$PROJECT_DIR/go.mod" ]] || \
     [[ -f "$PROJECT_DIR/Cargo.toml" ]] || \
     [[ -f "$PROJECT_DIR/.nvmrc" ]] || \
     [[ -f "$PROJECT_DIR/.ruby-version" ]] || \
     [[ -f "$PROJECT_DIR/.python-version" ]]; then
    echo "mise: no mise.toml found in this project. Run /mise-init to set up mise, or /mise-setup to have the agent do it automatically."
  fi
  exit 0
fi

# mise.toml found — run a quick doctor check
DOCTOR_OUTPUT="$(mise doctor 2>&1)" || true
DOCTOR_EXIT=$?

if [[ $DOCTOR_EXIT -ne 0 ]]; then
  echo "mise doctor found issues:"
  echo "$DOCTOR_OUTPUT"
  echo ""
  echo "Run /mise-doctor to diagnose and fix, or 'mise doctor' directly."
fi

# Exit 0 always — this is informational, not blocking
exit 0
