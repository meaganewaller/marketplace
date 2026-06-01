---
description: Batch-evaluate all skills in a plugin or directory for quality and compliance
argument-hint: <plugin-or-skills-path> [--deep]
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Skills Eval

Batch evaluation of skills — static quality audit plus optional behavioral probes.
Part of the **meta** plugin evaluation suite.

## Usage

```text
/meta:skills-eval plugins/meta
/meta:skills-eval plugins/git
/meta:skills-eval plugins/meta/skills --deep
```

Pass `--deep` to run behavioral scenarios (via `/meta:test-skill` workflow) on
each skill. Default is static audit only.

## Instructions

When invoked:

1. **Resolve scope** — Parse `$ARGUMENTS`:
   - Plugin path (contains `.claude-plugin/plugin.json`) → evaluate all
     `skills/*/SKILL.md` under it
   - Skills directory → evaluate each immediate subdirectory with `SKILL.md`
   - If empty, default to `plugins/meta` or ask the user

2. **Detect mode** — If arguments include `--deep`, run behavioral probes per
   skill at `medium` strictness. Otherwise static audit only.

3. **Discover skills** — Glob `**/SKILL.md` within scope (one level per skill dir).

4. **Static audit each skill** — For each skill, apply **skill-development**
   `references/quality-checklist.md` and summarize:
   - PASS / PASS WITH WARNINGS / FAIL
   - Top 1–3 issues (critical and warnings only in summary)

5. **Deep mode** — For each skill, run the `/meta:test-skill` workflow at medium
   strictness (abbreviated: 2 scenarios per level max to control cost).

6. **Cross-skill analysis** — Flag:
   - Overlapping trigger phrases between skills in the same plugin
   - Duplicate content across SKILL.md files
   - Skills missing from plugin README Components section

7. **Report** — Aggregate results. Do not modify files unless asked.

## Output Format

```markdown
# Skills Eval: <scope>

**Mode:** static | deep
**Skills found:** N

## Summary
| Skill | Static | Behavioral | Top issue |
| --- | --- | --- | --- |

## Overall Result
PASS | PASS WITH WARNINGS | FAIL

## Per-Skill Details

### <skill-name>
**Static:** PASS | PASS WITH WARNINGS | FAIL
<bulleted findings>

**Behavioral:** (deep mode only)
<scenario summary>

## Cross-Skill Issues
- overlapping triggers, README gaps, duplication

## Recommendations
- prioritized next steps
```

Suggest `/meta:test-skill <path> high` for deep-diving a single failing skill.
