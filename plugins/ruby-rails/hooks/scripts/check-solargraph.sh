#!/usr/bin/env bash
# Ensure Solargraph is available for Claude Code LSP integration.
# Adapted from boostvolt/claude-code-lsps solargraph plugin (MIT).

set -euo pipefail

PREFIX="[ruby-rails:solargraph]"

solargraph_available() {
	command -v solargraph &>/dev/null
}

install_solargraph() {
	local -a gem_cmd=("$@")
	echo "$PREFIX Installing solargraph..."
	if "${gem_cmd[@]}" gem install solargraph && solargraph_available; then
		echo "$PREFIX Installed successfully"
		return 0
	fi
	return 1
}

if solargraph_available; then
	exit 0
fi

# Prefer mise-managed Ruby when available
if command -v mise &>/dev/null; then
	if install_solargraph mise exec --; then
		exit 0
	fi
fi

# Fall back to current PATH gem
if command -v gem &>/dev/null; then
	if install_solargraph; then
		exit 0
	fi
fi

echo "$PREFIX solargraph is not installed."
echo "$PREFIX Install: mise exec -- gem install solargraph"
echo "$PREFIX Or add to Gemfile: gem \"solargraph\", group: :development"
echo "$PREFIX Docs: https://solargraph.org/"

exit 0
