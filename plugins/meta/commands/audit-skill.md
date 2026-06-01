---
description: Audit a Claude Code skill for structure, triggers, and quality best practices
argument-hint: <skill-path>
---

# Audit Skill

Evaluate a skill directory against the skill-development quality checklist.

## Usage

```text
/meta:audit-skill plugins/meta/skills/skill-development
/meta:audit-skill ~/.cursor/skills-cursor/create-skill
```

## Instructions

When invoked:

1. **Resolve target** — Use `$ARGUMENTS` as the skill directory path. The path
   must contain `SKILL.md` or end at the skill directory that will contain it.
   If empty, ask the user which skill to audit.

2. **Apply skill-development skill** — Load and follow
   `references/quality-checklist.md`.

3. **Inspect files** — Read `SKILL.md` frontmatter and body. Verify referenced
   files in `references/`, `scripts/`, and `assets/` exist. Count lines in
   `SKILL.md`.

4. **Evaluate triggers** — Assess whether the description includes specific,
   third-person trigger phrases and whether they overlap heavily with sibling
   skills in the same plugin.

5. **Report findings** — Produce a structured audit. Do not modify files unless
   the user explicitly asks to fix issues.

## Output Format

```markdown
# Skill Audit: <skill-name>

**Result:** PASS | PASS WITH WARNINGS | FAIL

## Summary
<one paragraph>

## Metrics
| Metric | Value |
| --- | --- |
| SKILL.md lines | N |
| Reference files | N |
| Scripts | N |

## Critical
- issue — recommendation

## Warnings
- issue — recommendation

## Suggestions
- issue — recommendation

## Checklist
Copy the quality-checklist items with ✅ / ⚠️ / ❌ per row.
```

Include concrete rewrite suggestions for weak `description` frontmatter when
findings are present.
