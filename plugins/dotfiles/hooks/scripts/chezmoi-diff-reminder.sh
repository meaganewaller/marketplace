#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# After Write/Edit completes inside the dotfiles source tree (under home/),
# print a one-line reminder to run `chezmoi diff` before committing.
# This is a soft nudge — exits 0, never blocks.

INPUT=$(cat)

FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [[ -z "$FILE" ]]; then
	exit 0
fi

FILE="${FILE/#\~/$HOME}"

# Resolve the dotfiles repo path the same way enforce-source-only.sh does.
REPO_PATH=""
for candidate in \
	"${PWD}/.claude/dotfiles.local.md" \
	"${HOME}/.claude/dotfiles.local.md"; do
	if [[ -f "$candidate" ]]; then
		REPO_PATH=$(awk '/^---$/{flag=!flag; next} flag && /^repo_path:/{print $2; exit}' "$candidate" | tr -d '"' || true)
		REPO_PATH="${REPO_PATH/#\~/$HOME}"
		if [[ -n "$REPO_PATH" && -d "$REPO_PATH" ]]; then
			break
		fi
		REPO_PATH=""
	fi
done

# Work out the source directory chezmoi reads. A configured repo_path is the
# repo root, so descend into whatever .chezmoiroot names (the repo root itself
# when there is none). `chezmoi source-path` already returns that directory —
# appending home/ to it again is why the reminder once never fired.
SOURCE_DIR=""
if [[ -n "$REPO_PATH" ]]; then
	SOURCE_DIR="$REPO_PATH"
	if [[ -f "$REPO_PATH/.chezmoiroot" ]]; then
		read -r CHEZMOI_ROOT <"$REPO_PATH/.chezmoiroot" || true
		[[ -n "${CHEZMOI_ROOT:-}" ]] && SOURCE_DIR="$REPO_PATH/$CHEZMOI_ROOT"
	fi
elif command -v chezmoi >/dev/null 2>&1; then
	SOURCE_DIR=$(chezmoi source-path 2>/dev/null || true)
fi

if [[ -z "$SOURCE_DIR" ]]; then
	exit 0
fi

# Only nudge for edits inside the source directory.
case "$FILE" in
"${SOURCE_DIR%/}"/*) ;;
*) exit 0 ;;
esac

# Use the JSON output channel so the reminder shows up as transcript context
# without being mistaken for an error.
jq -n \
	--arg file "$FILE" \
	'{
		systemMessage: "[dotfiles] Edited \($file) — run `chezmoi diff` to preview, then `chezmoi apply` to update the destination."
	}'

exit 0
