# Token Efficiency for Modular Skills

Guidelines for minimal context overhead while keeping skills composable.

## Three-Level Loading

| Level | Content | Cost |
| --- | --- | --- |
| 1 | `name` + `description` | Always in discovery context |
| 2 | `SKILL.md` body | On skill trigger |
| 3 | `references/`, `scripts/`, `assets/` | On demand |

Design so level 2 answers "what do I do next?" and level 3 holds depth.

## Sizing Targets

| Artifact | Target |
| --- | --- |
| `SKILL.md` body | Under 500 lines; ~1,500 words for core workflow |
| `description` | Enough triggers to be found; avoid listing every sibling task |
| Single reference file | Focused; split if >~2,000 words or mixed concerns |
| Examples in `SKILL.md` | Minimal; full examples in `references/` |

Oversized `SKILL.md` usually means missing splits (skills) or missing references
(files), not missing prose.

## What Belongs Where

**Keep in `SKILL.md`:**

- Core workflow steps
- Decision tables (which skill/command next)
- Links to references with when-to-load cues
- One short illustrative example if it prevents misuse

**Move to `references/`:**

- Checklists, rubrics, schemas
- Long API or CLI documentation
- Multiple variant examples
- Severity tables and audit rubrics

**Use `scripts/` when:**

- The same deterministic check runs repeatedly
- Output must be stable across runs
- Token cost of re-deriving logic exceeds reading a small script

**Use `assets/` when:**

- Files are copied or transformed into output, not read for reasoning
- Templates, images, boilerplate projects

## Composability vs Context

Composable skill sets can increase total plugin size but should not increase
**per-task** context:

- Trigger only the skills needed for the user's phrase
- Hand off instead of prefetching sibling skill bodies
- Commands load one checklist reference per target, not all plugin skills

## Splitting for Token Efficiency

Split a skill when:

- Only a subset of users need a heavy reference (e.g. advanced API docs)
- Triggers are disjoint and loading the full body wastes context
- A command batch-audits many skills without loading all `SKILL.md` bodies

Keep merged when:

- Splitting would always load two skills for one common request
- The combined body remains within sizing targets

## Audit Signals (Token Waste)

- `SKILL.md` duplicates a `references/` file
- Command body contains a full checklist already in a skill
- `description` lists unrelated tasks "just in case"
- Multiple skills with near-identical trigger lists
- Large inline JSON/YAML schemas in `SKILL.md`

Run `/meta:audit-skill` for line counts and broken reference paths; apply
**skill-development** `references/quality-checklist.md` for pass/fail criteria.
