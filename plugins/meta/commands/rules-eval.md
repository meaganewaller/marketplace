---
description: Evaluate Cursor rules and agent instruction files for clarity and enforceability
argument-hint: <path-or-scope> [low|medium|high]
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Rules Eval

Behavioral and structural evaluation of AI rules — Cursor rules, `CLAUDE.md`,
`AGENTS.md`, and plugin instruction files. Part of the **meta** plugin evaluation
suite.

## Usage

```text
/meta:rules-eval .cursor/rules
/meta:rules-eval CLAUDE.md
/meta:rules-eval plugins/ruby-rails/CLAUDE.md medium
/meta:rules-eval .
```

Scope can be a file, directory, or repo root (`.`). Optional strictness:
`low`, `medium` (default), or `high`.

## Supported Targets

| Target | Location |
| --- | --- |
| Cursor rules | `.cursor/rules/*.mdc`, `.cursor/rules/*.md` |
| Project instructions | `CLAUDE.md`, `AGENTS.md` |
| Plugin instructions | `plugins/*/CLAUDE.md` |
| Rule sections | `CLAUDE.md § Section Name` (evaluate one section) |

## Instructions

When invoked:

1. **Resolve scope** — Parse path and optional strictness from `$ARGUMENTS`. If
   empty, ask which rules to evaluate or default to `.cursor/rules` and `CLAUDE.md`
   when present.

2. **Discover rule files** — Glob within scope. Read each file fully.

3. **Structural audit** — For Cursor rules (`.mdc`), check:
   - YAML frontmatter present (`description`, `globs`, `alwaysApply`)
   - `alwaysApply: true` OR non-empty `globs` (not both missing)
   - Content is actionable (imperative instructions, not vague principles)
   - Reasonable length (flag rules over ~500 lines)

4. **Extract enforceable rules** — From all files in scope, list explicit
   constraints: "must", "never", "always", "required", "CRITICAL", "IMPORTANT".
   Number as R1, R2…

5. **Generate scenarios** — 2–3 probes per strictness level that test whether an
   agent following these rules would behave correctly. Include:
   - File-context scenarios (when globs apply)
   - Conflict scenarios (two rules disagree)
   - Edge cases (rule silent on the situation)

6. **Run probes** — Spawn read-only subagents (Task tool) with scenario prompts
   and the extracted rules as context. Classify: **compliant**, **partial**,
   **non-compliant**.

7. **Report** — Do not modify rule files unless asked.

## Output Format

```markdown
# Rules Eval: <scope>

**Strictness:** low | medium | high
**Files:** N
**Result:** PASS | PASS WITH WARNINGS | FAIL

## Summary
<one paragraph>

## Files Audited
| File | alwaysApply | globs | Lines | Issues |
| --- | --- | --- | --- | --- |

## Rules Extracted
| ID | Source | Rule |
| --- | --- | --- |

## Scenarios
| # | Level | Prompt | Result | Violated rules |
| --- | --- | --- | --- | --- |

## Structural Issues
- frontmatter, globs, length, vagueness

## Recommendations
- split oversized rules, clarify conflicts, add globs, strengthen CRITICAL blocks
```

Pair with `/meta:skills-eval` when rules and skills overlap in the same project.
