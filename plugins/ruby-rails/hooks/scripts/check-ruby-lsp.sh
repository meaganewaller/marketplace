#!/usr/bin/env bash
# Ensure Ruby LSP is available for Claude Code LSP integration.
# Adapted from opendate-app/ruby-lsp-plugin (MIT).
#
# Runs on every SessionStart in every repo, so it does nothing outside a Ruby
# project. Inside one it installs ruby-lsp only onto a mise-managed Ruby:
# conventions.md forbids `gem install` into the system Ruby, and without a
# mise-managed Ruby both `mise exec -- gem` and a bare `gem` resolve to
# whatever Ruby is on PATH.

set -euo pipefail

PREFIX="[ruby-rails:ruby-lsp]"

is_ruby_project() {
	local marker
	for marker in Gemfile gems.rb .ruby-version; do
		[[ -f "$marker" ]] && return 0
	done
	compgen -G "*.gemspec" >/dev/null && return 0
	# A mise or asdf pin counts only when it pins Ruby.
	for marker in mise.toml .mise.toml .tool-versions; do
		[[ -f "$marker" ]] && grep -Eq '^[[:space:]]*"?ruby"?[[:space:]]*[=[:space:]]' "$marker" && return 0
	done
	return 1
}

is_ruby_project || exit 0
command -v ruby-lsp &>/dev/null && exit 0

if command -v mise &>/dev/null && mise which ruby &>/dev/null; then
	echo "$PREFIX Installing ruby-lsp onto the mise-managed Ruby..."
	if mise exec -- gem install ruby-lsp && command -v ruby-lsp &>/dev/null; then
		echo "$PREFIX Installed successfully"
		exit 0
	fi
fi

echo "$PREFIX ruby-lsp is not installed."
echo "$PREFIX Install: mise use ruby && mise exec -- gem install ruby-lsp"
echo "$PREFIX Or add to Gemfile: gem \"ruby-lsp\", group: :development"
echo "$PREFIX Verify: which ruby-lsp"
echo "$PREFIX Docs: https://github.com/Shopify/ruby-lsp"

exit 0
