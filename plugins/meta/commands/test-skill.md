---
description: Run behavioral scenarios against a single skill to test trigger and rule compliance
argument-hint: <skill-path> [low|medium|high]
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Test Skill

Behavioral evaluation of one skill — generate probe scenarios, run them through
subagents, and classify compliance. Part of the **meta** plugin; complements
static `/meta:audit-skill`.

## Usage

```text
/meta:test-skill plugins/meta/skills/skill-development
/meta:test-skill plugins/git/skills/git-commit medium
/meta:test-skill ~/.cursor/skills/commit high
```

Second argument sets strictness: `low`, `medium` (default), or `high`.

## Instructions

When invoked:

1. **Resolve target** — Use the first token of `$ARGUMENTS` as the skill directory
   or path to `SKILL.md`. Resolve to a directory containing `SKILL.md`. If empty,
   ask which skill to test.

2. **Parse strictness** — Optional second token: `low`, `medium`, or `high`.
   Default `medium`.

3. **Apply skill-development skill** — Read `SKILL.md` and bundled references.

4. **Extract contract** — Identify enforceable rules: "must", "never", "always",
   "required", "CRITICAL", and procedural steps the skill mandates. List as R1, R2…

5. **Generate scenarios** — Create 2–3 scenarios per strictness level that probe:
   - Trigger phrases in the description (would this skill activate?)
   - Each enforceable rule under realistic user prompts
   - Edge cases (empty input, conflicting instructions, partial context)

   | Level | Probes |
   | --- | --- |
   | low | Happy path, obvious trigger |
   | medium | Ambiguous phrasing, partial rule coverage |
   | high | Adversarial prompts, rule conflicts, missing context |

6. **Run probes** — For each scenario, spawn a read-only subagent (Task tool) with:
   - The scenario user prompt
   - The skill content as context
   - Instruction to respond as if the skill were active and list which rules applied

   Do not modify production files during probes.

7. **Classify results** — Per scenario: **compliant**, **partial**, or **non-compliant**
   with evidence (which rules were followed or violated).

8. **Report** — Structured eval report. Do not modify the skill unless asked.

## Output Format

```markdown
# Skill Test: <skill-name>

**Strictness:** low | medium | high
**Result:** PASS | PASS WITH WARNINGS | FAIL

## Summary
<one paragraph>

## Rules Under Test
| ID | Rule |
| --- | --- |

## Scenarios
| # | Level | Prompt | Result | Notes |
| --- | --- | --- | --- | --- |

## Compliance
| Rule | Pass | Partial | Fail |
| --- | --- | --- | --- |

## Recommendations
- Concrete improvements to description, triggers, or SKILL.md body
```

Suggest `/meta:audit-skill` for static quality fixes and `/meta:skills-eval` to
batch-test all skills in a plugin.
