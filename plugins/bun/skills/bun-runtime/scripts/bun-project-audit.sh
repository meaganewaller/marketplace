#!/usr/bin/env bash
# Report the facts needed before giving advice about a Bun project.
#
# Answers the questions most often guessed wrong: which Bun version applies,
# whether the lockfile is the modern text format, whether lifecycle scripts are
# blocked, and whether the project is a workspace.
#
# Usage: bun-project-audit.sh [project-dir]   (defaults to the current directory)

set -uo pipefail

readonly DIR="${1:-.}"

if [[ ! -d "$DIR" ]]; then
	printf 'error: not a directory: %s\n' "$DIR" >&2
	exit 1
fi

cd "$DIR" || exit 1

say() { printf '\n== %s ==\n' "$1"; }
kv() { printf '  %-22s %s\n' "$1" "$2"; }

say "Bun"
if command -v bun >/dev/null 2>&1; then
	kv "version" "$(bun --version)"
	kv "path" "$(command -v bun)"
else
	kv "version" "NOT INSTALLED — install with: mise use -g bun@latest"
	exit 1
fi

say "Project"
kv "directory" "$(pwd)"
if [[ -f package.json ]]; then
	kv "package.json" "present"
	kv "name" "$(bun pm pkg get name 2>/dev/null | tr -d '"' || echo '?')"
	if bun pm pkg get workspaces >/dev/null 2>&1 &&
		[[ "$(bun pm pkg get workspaces 2>/dev/null)" != "{}" ]]; then
		kv "workspaces" "yes — use --filter to scope commands"
	else
		kv "workspaces" "no"
	fi
	trusted="$(bun pm pkg get trustedDependencies 2>/dev/null || true)"
	[[ -n "$trusted" && "$trusted" != "{}" ]] && kv "trustedDependencies" "$trusted"
	patched="$(bun pm pkg get patchedDependencies 2>/dev/null || true)"
	[[ -n "$patched" && "$patched" != "{}" ]] && kv "patchedDependencies" "$patched"
else
	kv "package.json" "MISSING — run: bun init"
fi

say "Lockfile"
if [[ -f bun.lock ]]; then
	kv "bun.lock" "present (text format, current)"
	kv "conflicts" "hand-resolvable; it is a normal text file"
elif [[ -f bun.lockb ]]; then
	kv "bun.lockb" "LEGACY BINARY FORMAT"
	kv "action" "migrate: bun install --save-text-lockfile && rm bun.lockb"
else
	kv "lockfile" "none — run: bun install"
fi
for other in package-lock.json yarn.lock pnpm-lock.yaml; do
	[[ -f "$other" ]] && kv "stale lockfile" "$other — remove it to prevent drift"
done

say "Config"
[[ -f bunfig.toml ]] && kv "bunfig.toml" "present" || kv "bunfig.toml" "absent"
[[ -f tsconfig.json ]] && kv "tsconfig.json" "present" || kv "tsconfig.json" "absent"
[[ -f .npmrc ]] && kv ".npmrc" "present (registry/auth may come from here)"
[[ -f mise.toml || -f .mise.toml ]] && kv "mise" "manages this project's toolchain"

say "Dependencies"
if [[ -d node_modules ]]; then
	kv "node_modules" "installed"
	# Gate on the stable prose line, not on the bullet glyph, so a cosmetic
	# output change cannot make this report "none" when scripts were blocked.
	untrusted="$(bun pm untrusted 2>/dev/null || true)"
	if grep -qi 'lifecycle scripts blocked' <<<"$untrusted"; then
		blocked="$(grep -c '»' <<<"$untrusted" || true)"
		if [[ "${blocked:-0}" -gt 0 ]]; then
			kv "blocked scripts" "$blocked — inspect with: bun pm untrusted"
		else
			kv "blocked scripts" "PRESENT — inspect with: bun pm untrusted"
		fi
	else
		kv "blocked scripts" "none"
	fi
else
	kv "node_modules" "absent — run: bun install"
fi

say "Tests"
count="$(find . -type d -name node_modules -prune -o \
	-type f \( -name '*.test.*' -o -name '*.spec.*' -o -name '*_test_*' -o -name '*_spec_*' \) \
	-print 2>/dev/null | wc -l | tr -d ' ')"
kv "test files" "$count (discovery is filename-based; no include/exclude config)"

say "Next"
cat <<'EOF'
  bun audit                     check dependencies for known vulnerabilities
  bun outdated                  see what is behind latest
  bun install --frozen-lockfile reproduce the CI install locally
  bun <subcommand> --help       authoritative flags — do not guess
EOF
