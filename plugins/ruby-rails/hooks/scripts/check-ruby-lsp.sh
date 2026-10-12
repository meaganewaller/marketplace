#!/usr/bin/env bash
# Ensure Ruby LSP is available for Claude Code LSP integration.
# Adapted from opendate-app/ruby-lsp-plugin (MIT).

set -euo pipefail

PREFIX="[ruby-rails:ruby-lsp]"

ruby_lsp_available() {
	command -v ruby-lsp &>/dev/null
}

# Arguments, if any, are a command prefix to run gem under (e.g. `mise exec --`).
# "$@" rather than a local array: bash before 4.4 — /bin/bash on macOS — treats
# an empty "${array[@]}" as unbound under `set -u`.
install_ruby_lsp() {
	echo "$PREFIX Installing ruby-lsp..."
	if "$@" gem install ruby-lsp && ruby_lsp_available; then
		echo "$PREFIX Installed successfully"
		return 0
	fi
	return 1
}

if ruby_lsp_available; then
	exit 0
fi

# Prefer mise-managed Ruby when available
if command -v mise &>/dev/null; then
	if install_ruby_lsp mise exec --; then
		exit 0
	fi
fi

# Fall back to current PATH gem
if command -v gem &>/dev/null; then
	if install_ruby_lsp; then
		exit 0
	fi
fi

echo "$PREFIX ruby-lsp is not installed."
echo "$PREFIX Install: mise exec -- gem install ruby-lsp"
echo "$PREFIX Or add to Gemfile: gem \"ruby-lsp\", group: :development"
echo "$PREFIX Verify: which ruby-lsp"
echo "$PREFIX Docs: https://github.com/Shopify/ruby-lsp"

exit 0
