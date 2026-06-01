---
description: Evaluate plugin hooks statically and run companion test scripts when present
argument-hint: <plugin-path> [--run-tests]
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Hooks Eval

Evaluation suite for plugin hooks — static validation plus optional test script
execution and scenario analysis. Part of the **meta** plugin; runs
`/meta:validate-hook` checks first, then goes deeper.

## Usage

```text
/meta:hooks-eval plugins/git
/meta:hooks-eval plugins/example-plugin --run-tests
/meta:hooks-eval plugins/git --run-tests
```

Pass `--run-tests` to execute companion `test-*.sh` scripts and probe command
hooks with documented mock inputs.

## Instructions

When invoked:

1. **Resolve target** — Parse plugin path from `$ARGUMENTS`. Detect `--run-tests`
   flag. If path empty, ask which plugin to evaluate.

2. **Static validation** — Apply the full `/meta:validate-hook` workflow using
   **hook-development** `references/hook-checklist.md`. Include the static
   findings in the final report.

3. **Inventory test scripts** — Glob `hooks/**/test-*.sh` and `hooks/test-*.sh`
   under the plugin. List run commands (e.g. `bash plugins/git/hooks/test-validate-pr-issue-links.sh`).

4. **Run tests (`--run-tests`)** — When flag is set:
   - Execute each discovered test script via bash
   - Capture exit code and output summary
   - Mark PASS/FAIL per script
   - Do not run hooks against production systems; tests must be self-contained

5. **Scenario analysis** — For each hook entry, document:
   - **Intent** — what the hook should allow or block
   - **Probe scenarios** — 1–2 realistic tool inputs (especially PreToolUse/PostToolUse)
   - **Expected outcome** — allow, block, or inject context

   For prompt hooks, classify scenarios as compliant/partial/non-compliant based
   on whether the prompt contract is clear enough to enforce the intent.

   For command hooks without test scripts, suggest mock stdin JSON tests (see git
   plugin `test-validate-pr-issue-links.sh` pattern).

6. **Cross-check README** — Confirm hooks are documented in plugin README.

7. **Report** — Do not modify hooks unless asked.

## Output Format

```markdown
# Hooks Eval: <plugin-name>

**Tests run:** yes | no
**Result:** PASS | PASS WITH WARNINGS | FAIL | N/A (no hooks)

## Summary
<one paragraph>

## Static Validation
<condensed validate-hook results>

## Test Scripts
| Script | Result | Notes |
| --- | --- | --- |
| (none found) | — | suggest adding test-*.sh |

## Hook Scenarios
| Event | Matcher | Scenario | Expected | Assessment |
| --- | --- | --- | --- | --- |

## Recommendations
- missing tests, unclear prompts, path fixes, timeout additions
```

Suggest `/meta:validate-hook` for quick static checks before merging hook changes.
