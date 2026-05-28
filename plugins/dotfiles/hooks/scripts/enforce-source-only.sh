#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Blocks Write/Edit to Chezmoi-managed destinations under $HOME.
# Returns exit 2 with a JSON decision payload that tells Claude to redirect
# the edit to the corresponding source path under the dotfiles repo.

INPUT=$(cat)

# Extract the file path the tool is about to write to.
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE" ]]; then
	exit 0
fi

# Expand ~ if present, then normalize.
FILE="${FILE/#\~/$HOME}"

# Only enforce on paths under $HOME — outside $HOME is the source tree itself
# (or some other repo entirely) and is not managed by Chezmoi.
case "$FILE" in
"$HOME"/* | "$HOME") ;;
*) exit 0 ;;
esac

# Skip the source tree itself, even though it lives under $HOME.
# Try to read the configured repo path. If we can't resolve it, fail open.
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

# Fall back to chezmoi's source-path if the binary is available.
if [[ -z "$REPO_PATH" ]] && command -v chezmoi >/dev/null 2>&1; then
	REPO_PATH=$(chezmoi source-path 2>/dev/null || true)
fi

# If the file being edited is *inside* the source tree, allow it.
if [[ -n "$REPO_PATH" ]]; then
	case "$FILE" in
	"$REPO_PATH"/* | "$REPO_PATH") exit 0 ;;
	esac
fi

# Detect Chezmoi management for this destination via chezmoi itself, if available.
# `chezmoi managed --include=files` lists every destination Chezmoi controls.
IS_MANAGED=0
if [[ -n "$REPO_PATH" ]] && command -v chezmoi >/dev/null 2>&1; then
	# Run from the source tree so chezmoi picks up the right config.
	if chezmoi managed --include=files --path-style=absolute 2>/dev/null --source="$REPO_PATH" 2>/dev/null | grep -Fxq "$FILE"; then
		IS_MANAGED=1
	fi
fi

# Fallback heuristic: pattern match common managed destinations.
# Conservative — only flag well-known dotfile paths.
if [[ "$IS_MANAGED" -eq 0 ]]; then
	case "$FILE" in
	"$HOME"/.zshrc | \
		"$HOME"/.zshenv | \
		"$HOME"/.bashrc | \
		"$HOME"/.profile | \
		"$HOME"/.tmux.conf | \
		"$HOME"/.gitconfig | \
		"$HOME"/.gitignore_global | \
		"$HOME"/.config/* | \
		"$HOME"/.local/share/chezmoi/* | \
		"$HOME"/.ssh/config | \
		"$HOME"/.ssh/authorized_keys)
		IS_MANAGED=1
		;;
	esac
fi

if [[ "$IS_MANAGED" -eq 0 ]]; then
	exit 0
fi

# Build the suggested source path. Heuristic: drop $HOME/ prefix, prepend dot_ to
# leading dot files, dot_config/ for ~/.config/, private_dot_ssh for ~/.ssh.
SUGGESTED=""
REL="${FILE#"$HOME"/}"
case "$REL" in
.config/*)
	SUGGESTED="home/dot_config/${REL#.config/}"
	;;
.ssh/*)
	SUGGESTED="home/private_dot_ssh/${REL#.ssh/}"
	;;
.*)
	SUGGESTED="home/dot_${REL#.}"
	;;
*)
	SUGGESTED="home/$REL"
	;;
esac

if [[ -n "$REPO_PATH" ]]; then
	SUGGESTED_ABS="$REPO_PATH/$SUGGESTED"
else
	SUGGESTED_ABS="<dotfiles-repo>/$SUGGESTED"
fi

# Emit a structured decision so Claude redirects the edit rather than retrying.
jq -n \
	--arg file "$FILE" \
	--arg suggested "$SUGGESTED_ABS" \
	'{
		decision: "block",
		reason: "\($file) is Chezmoi-managed — edit the source instead: \($suggested)\n\nAfter editing the source, run `chezmoi diff` and `chezmoi apply` to update the destination."
	}'

exit 2
