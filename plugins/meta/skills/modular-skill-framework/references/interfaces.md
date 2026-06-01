# Skill Interfaces and Contracts

Well-defined interfaces reduce ambiguous loading and sibling skill conflicts.

## Discovery Interface (`description`)

**Contract:**

- Third-person phrasing ("This skill should be used when...")
- Concrete user phrases in quotes
- States when to use, not only what the skill contains
- No heavy overlap with sibling skills in the same plugin

**Bad:**

```yaml
description: Git helpers and utilities.
```

**Good:**

```yaml
description: >-
  This skill should be used when the user says "commit locally", "stage and
  commit", or needs conventional commit message guidance for this repository.
```

## Activation Interface (`SKILL.md` body)

**Contract:**

- Ordered, imperative steps
- Links to references with **when to load**
- Names sibling skills or commands for handoffs
- No duplicate content that lives in `references/`

**Reference link pattern:**

```markdown
Before finishing, evaluate against `references/quality-checklist.md`.
For architecture boundaries, apply **modular-skill-framework**.
```

## Reference Interface (`references/`)

**Contract:**

- Paths relative to skill root
- One concern per file when possible (checklist vs patterns vs API schema)
- Referenced from `SKILL.md` with load guidance
- Files exist (broken paths are critical audit failures)

**When to load cues:**

- "Load when implementing X"
- "Load when auditing Y"
- "Load when the user asks about Z"

## Script Interface (`scripts/`)

**Contract:**

- Document purpose and invocation in `SKILL.md`
- Prefer `${CLAUDE_PLUGIN_ROOT}` in plugin hooks and command/bash steps
- Scripts are for deterministic repetition, not one-off exploration

## Command–Skill Interface

Commands should:

1. State which skill or reference to apply
2. Define arguments (`$ARGUMENTS`, frontmatter `argument-hint`)
3. Specify output format when users or automation depend on it
4. Avoid pasting large checklists that already live in a skill reference

Example contract (audit command):

```markdown
2. **Apply skill-development** — Load and follow
   `references/quality-checklist.md`.
```

The command does not redefine the checklist; it points at the canonical file.

## Handoff Template

When one skill defers to another:

```markdown
## Next steps

If the user needs <outcome>, apply **<sibling-skill-name>** (or run
`/plugin:command-name` when a fixed report template is required).
Required context: <paths, flags, or prior outputs>.
```

## Sibling Coordination Checklist

- [ ] Trigger phrases are distinct across plugin skills
- [ ] Shared docs have a single canonical path
- [ ] Handoffs name the target skill or command explicitly
- [ ] No two skills claim the same primary outcome in `description`
- [ ] Plugin README lists each skill with one-line scope
