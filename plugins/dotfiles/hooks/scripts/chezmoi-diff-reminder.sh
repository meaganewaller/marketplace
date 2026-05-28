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

if [[ -z "$REPO_PATH" ]] && command -v chezmoi >/dev/null 2>&1; then
	REPO_PATH=$(chezmoi source-path 2>/dev/null || true)
fi

if [[ -z "$REPO_PATH" ]]; then
	exit 0
fi

# Only nudge for edits inside the source tree's home/ directory.
case "$FILE" in
"$REPO_PATH"/home/*) ;;
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
