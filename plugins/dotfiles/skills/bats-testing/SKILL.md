---
name: bats-testing
description: Writing BATS specs for the dotfiles repo — file layout, shared helpers (assert_valid_shell, assert_script_structure), running via ./bin/test, CI integration. Triggers on "BATS", "bats test", "test shell script", ".bats file", "bin/test", "test_helper.bash", "bats-core", "shell test".
---

# BATS testing in the dotfiles

The dotfiles use [BATS](https://github.com/bats-core/bats-core) for shell-script-level tests. The runner is `./bin/test`, which delegates to `bats test/` after mise has installed the bats-core binary.

## Layout

```text
test/
├── test_helper.bash         # shared assertions and setup helpers
├── run_onchange_install-mise-tools.bats
├── install.bats
└── ...                       # one .bats file per script-under-test
```

One `.bats` file per script under test, named after the source filename.

## Running

```bash
./bin/setup       # one-time: installs bats via mise
./bin/test        # runs all tests
bats test/install.bats   # single file
bats -t test/     # TAP output for CI / structured parsing
```

`mise run test` is equivalent to `./bin/test` (see `mise.toml`).

## Test file skeleton

```bash
#!/usr/bin/env bats

# Load shared helpers
load test_helper

setup() {
  # Per-test setup. Cd to a temp dir, copy script under test, etc.
  export TEST_TMPDIR="$(mktemp -d)"
  cp "$BATS_TEST_DIRNAME/../home/.chezmoiscripts/run_onchange_install-mise-tools.sh.tmpl" "$TEST_TMPDIR/script.sh"
}

teardown() {
  rm -rf "$TEST_TMPDIR"
}

@test "script is valid bash" {
  assert_valid_shell "$TEST_TMPDIR/script.sh"
}

@test "script declares strict mode" {
  assert_script_structure "$TEST_TMPDIR/script.sh"
}

@test "happy path: installs nothing when already installed" {
  # Stub mise to claim everything is installed
  PATH="$TEST_TMPDIR/stubs:$PATH"
  mkdir "$TEST_TMPDIR/stubs"
  cat > "$TEST_TMPDIR/stubs/mise" <<'EOF'
#!/usr/bin/env bash
case "$1" in
  ls) echo "node 22.0.0"; exit 0 ;;
  install) exit 0 ;;
esac
EOF
  chmod +x "$TEST_TMPDIR/stubs/mise"

  run bash "$TEST_TMPDIR/script.sh"
  [ "$status" -eq 0 ]
}
```

## Shared helpers (`test_helper.bash`)

The two most-used helpers:

- **`assert_valid_shell <path>`** — runs `bash -n` to syntax-check the script without executing it. Catches typos and missing quotes early.
- **`assert_script_structure <path>`** — checks the script declares strict mode (`set -o errexit -o nounset` minimum) and starts with a valid shebang.

Read `test/test_helper.bash` directly for the full list — new helpers should be added there, not duplicated across test files.

## Testing templates (`.tmpl` scripts)

Render the template first with `chezmoi execute-template`, then test the rendered output:

```bash
@test "renders correctly for darwin" {
  rendered=$(chezmoi execute-template \
    --init \
    --promptString='git.name=Test' \
    < "$BATS_TEST_DIRNAME/../home/.chezmoiscripts/run_onchange_install-packages-darwin.sh.tmpl")
  echo "$rendered" | grep -q "brew bundle"
}
```

Keep template-render tests separate from logic tests so a template syntax error doesn't mask a logic bug.

## What to test

| Worth testing | Skip |
| --- | --- |
| Idempotency: script doesn't fail on second run | The contents of upstream tools (brew, mise) |
| Strict-mode declaration is present | Trivial one-liners |
| Required-binary guards exit nonzero with a helpful message | Cosmetic output formatting |
| OS guards exit early on the wrong platform | Functions that wrap a single command call |
| Edge cases for parsed input (empty data files, missing keys) | Anything where the test would just re-implement the script |

## CI integration

The repo's GitHub Actions runs:

1. ShellCheck on all shell scripts
2. `mise install`
3. `./bin/test` (which is `bats test/`)

Locally you can mirror this with `mise run ci:all`. The CI test task sets `CI=true GITHUB_ACTIONS=true` env vars, so tests can branch on those.

## Stubbing external tools

Bats has no built-in mock framework. The convention is a per-test `$TEST_TMPDIR/stubs/` directory prepended to `PATH` with hand-written stub scripts (see the example above). For complex stubs, consider extracting into `test_helper.bash`.

## Linux notes

- BATS itself is platform-independent.
- macOS-specific scripts (`configure-macos-preferences.sh.tmpl`) should be tagged with `# bats file_tags=darwin` and skipped on Linux CI: `if [[ "$(uname -s)" != "Darwin" ]]; then skip; fi` at the top of the test.

## Related

- [[chezmoi-scripts]] — the scripts these tests cover
- [[chezmoi-templates]] — for `.tmpl` render testing
