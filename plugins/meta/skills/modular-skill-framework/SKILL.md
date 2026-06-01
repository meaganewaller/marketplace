---
name: modular-skill-framework
description: >-
  This skill should be used when the user asks about "modular skills", "composable
  skills", "skill composition", "split a skill", "skill boundaries", "skill
  interfaces", "token-efficient skills", "single responsibility for skills", or
  needs design patterns and implementation guidelines for reusable skill
  components in Claude Code plugins.
---

# Modular Skills Framework

Design patterns and implementation guidelines for reusable skill components that
compose cleanly, stay focused, and minimize context overhead.

## Core Principles

- **Single Responsibility** — One focused purpose per skill; one primary workflow
  or decision domain.
- **Composable Design** — Skills combine via explicit handoffs, shared references,
  and sibling skills rather than monolithic instructions.
- **Clear Interfaces** — Well-defined contracts for triggers, inputs, outputs, and
  bundled resources so agents know what to load and when.
- **Token Efficiency** — Minimal always-on context; bulk detail in `references/`,
  determinism in `scripts/`, output files in `assets/`.

## When to Use This Skill vs skill-development

| Question | Use |
| --- | --- |
| How to write `SKILL.md`, frontmatter, triggers | **skill-development** |
| Whether to split/merge skills, compose a plugin skill set | **modular-skill-framework** |
| Quality audit of one skill | **skill-development** + `/meta:audit-skill` |
| Plugin directory layout, `plugin.json` | **plugin-structure** |

Apply both when scaffolding a new skill ecosystem: use this skill for boundaries
and composition, then **skill-development** for file-level authoring and the
quality checklist.

## Skill Boundaries (Single Responsibility)

Before adding content to an existing skill, ask:

1. **Trigger test** — Would a different user phrase activate a different workflow?
   If yes, consider a sibling skill with its own `description` triggers.
2. **Audience test** — Does the content serve a different role (author vs auditor
   vs operator)? Split by role when workflows diverge.
3. **Depth test** — Is the material reference documentation (>~300 words, schemas,
   checklists)? Move to `references/`; if the reference set has its own lifecycle,
   consider a dedicated skill.
4. **Overlap test** — Do trigger phrases collide with a sibling in the same plugin?
   Narrow descriptions or merge skills.

**Prefer:**

- One primary outcome per skill (e.g. "create commit" not "all of git")
- Commands for one-shot audits; skills for reusable authoring patterns
- Shared `references/` only when two skills truly share stable docs

**Avoid:**

- Kitchen-sink skills that list every related task in one `description`
- Duplicating the same checklist in multiple skills (link once, load on demand)
- Nested skill directories or multiple `SKILL.md` files per skill name

## Composable Design

Skills compose at three layers:

```text
Plugin skill set
├── Sibling skills     # Parallel specialists (git-commit, git-push, git-pr)
├── Commands           # Orchestrated one-shots (/meta:audit-skill)
└── Bundled resources  # Shared references/scripts where justified
```

**Composition patterns:**

1. **Pipeline** — Skill A ends with "then apply **skill-b**" when the user needs
   the next phase. Name the sibling explicitly; do not paste skill-b's body.
2. **Facade + specialists** — A thin overview skill (rare) points to focused
   siblings; prefer plugin README and discovery via distinct triggers instead.
3. **Command orchestration** — Multi-step evaluation (e.g. batch skill audit) lives
   in `commands/`, loading each target skill's checklist reference on demand.
4. **Reference library** — One canonical reference file; other skills link to it
   with a one-line "when to load" cue instead of copying content.

When designing a new plugin skill set, sketch triggers in a table (phrase → skill)
before writing bodies. Eliminate ambiguous rows before implementation.

## Clear Interfaces

Every skill exposes interfaces agents and commands rely on:

| Interface | Contract |
| --- | --- |
| **Discovery** | `description` lists specific third-person trigger phrases |
| **Activation** | `SKILL.md` body = essential procedure only |
| **References** | Linked with when-to-load guidance; paths relative to skill root |
| **Scripts** | Documented invocation; use `${CLAUDE_PLUGIN_ROOT}` in plugins |
| **Handoff** | Name sibling skill or command; state required inputs ($ARGUMENTS, paths) |
| **Output** | Stable headings or templates when consumers (commands, users) depend on format |

Commands that invoke skills should say which reference to apply (e.g.
`references/quality-checklist.md`) rather than inlining checklist text.

See `references/interfaces.md` for handoff templates and anti-patterns.

## Token Efficiency

Load context in layers (see **skill-development** progressive disclosure):

1. Metadata — always available
2. `SKILL.md` — on trigger
3. `references/`, `scripts/`, `assets/` — only when needed

**Rules of thumb:**

- Target a lean `SKILL.md` (~1,500 words or less in the body)
- Move schemas, long examples, and checklists to `references/`
- Use scripts for repeated deterministic checks instead of re-deriving steps
- Do not load `assets/` into context unless transforming them

See `references/token-efficiency.md` for sizing and splitting guidance.

## Implementation Workflow

1. **Define the skill graph** — List skills, triggers, and handoffs for the plugin.
2. **Assign responsibilities** — One primary outcome per skill; merge or split until
   the trigger table has no ambiguous rows.
3. **Design interfaces** — Frontmatter triggers, reference links, command entry points.
4. **Scaffold directories** — Create only `references/`, `scripts/`, `assets/` in use.
5. **Author with skill-development** — Write `SKILL.md`, run quality checklist.
6. **Validate composition** — Check sibling overlap, handoff clarity, and README
   component list.

## Additional Resources

- **`references/design-patterns.md`** — Split/merge heuristics, composition patterns, examples
- **`references/interfaces.md`** — Contracts, handoffs, command–skill integration
- **`references/token-efficiency.md`** — Context budgeting and reference sizing
