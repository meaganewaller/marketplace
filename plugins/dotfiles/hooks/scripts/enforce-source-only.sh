#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Blocks Write/Edit to Chezmoi-managed destinations under $HOME, redirecting the
# edit to the corresponding source file.
#
# chezmoi itself is the single source of truth: `chezmoi source-path <dest>`
# succeeds and prints the source path iff the destination is managed. We do NOT
# guess with path heuristics — the previous `~/.config/*`-style fallback
# over-flagged unmanaged files (e.g. chezmoi's own ~/.config/chezmoi/chezmoi.toml)
# and the hand-built "home/<...>" suggestion double-prefixed the source dir
# (producing paths like .../home/home/dot_config/...).

INPUT=$(cat)

# Extract the file path the tool is about to write to.
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ -z "$FILE" ]] && exit 0

# Expand a leading ~.
FILE="${FILE/#\~/$HOME}"

# Only paths under $HOME can be managed destinations. Outside $HOME is the source
# tree itself (or an unrelated repo) and is never a managed destination.
case "$FILE" in
"$HOME"/* | "$HOME") ;;
*) exit 0 ;;
esac

# We need chezmoi to answer authoritatively; if it's unavailable, fail open.
command -v chezmoi >/dev/null 2>&1 || exit 0

# Optional: an explicitly configured repo path lets chezmoi resolve even when the
# default config isn't pointed at this dotfiles tree. Read repo_path from
# dotfiles.local.md (project-local first, then user-level).
REPO_PATH=""
for candidate in \
	"${PWD}/.claude/dotfiles.local.md" \
	"${HOME}/.claude/dotfiles.local.md"; do
	if [[ -f "$candidate" ]]; then
		REPO_PATH=$(awk '/^---$/{flag=!flag; next} flag && /^repo_path:/{print $2; exit}' "$candidate" | tr -d '"' || true)
		REPO_PATH="${REPO_PATH/#\~/$HOME}"
		[[ -n "$REPO_PATH" && -d "$REPO_PATH" ]] && break
		REPO_PATH=""
	fi
done

# Ask chezmoi for the source path. Success => managed, and the output IS the
# source file to edit instead. Failure (non-zero) => not managed => allow.
# This also naturally allows edits to files inside the source tree, since
# `chezmoi source-path` on a source file returns non-zero.
if [[ -n "$REPO_PATH" ]]; then
	SRC=$(chezmoi --source "$REPO_PATH" source-path "$FILE" 2>/dev/null) || exit 0
else
	SRC=$(chezmoi source-path "$FILE" 2>/dev/null) || exit 0
fi
[[ -n "$SRC" ]] || exit 0

# Emit a structured decision so Claude redirects the edit rather than retrying.
jq -n \
	--arg file "$FILE" \
	--arg suggested "$SRC" \
	'{
		decision: "block",
		reason: "\($file) is Chezmoi-managed — edit the source instead: \($suggested)\n\nAfter editing the source, run `chezmoi diff` and `chezmoi apply` to update the destination."
	}'

exit 2
