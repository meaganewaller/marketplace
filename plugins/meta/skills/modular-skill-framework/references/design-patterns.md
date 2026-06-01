# Modular Skill Design Patterns

Patterns for structuring composable skill sets in Claude Code plugins.

## Single Responsibility Patterns

### Specialist skill (default)

One domain action, one primary workflow.

```text
git-commit/   → stage, message, commit locally
git-push/     → push to remote
git-pr/       → open pull request
```

Each `description` lists phrases for that action only.

### Auditor vs author

Split when the workflow differs even if the domain is the same:

```text
skill-development/     → create and improve SKILL.md
(meta:audit-skill)       → evaluate against checklist (command-driven)
```

Authoring guidance stays in the skill; one-shot audits can be commands that
load `references/quality-checklist.md` without duplicating it in the command body.

### When to merge skills

Merge when:

- Triggers always co-occur and the combined body stays under the size budget
- Splitting would force identical `references/` in two places with no handoff benefit
- One skill would only be a single paragraph pointing at another

Do not merge when trigger phrases or roles differ materially.

## Composable Design Patterns

### Pipeline handoff

End `SKILL.md` with an explicit next step:

```markdown
After committing, if the user wants to push or open a PR, apply **git-push**
or **git-pr** respectively.
```

Do not duplicate those skills' procedures.

### Shared reference (canonical doc)

Place shared material once:

```text
skill-development/references/quality-checklist.md
```

Other skills and commands link:

```markdown
Evaluate against `references/quality-checklist.md` in **skill-development**.
```

### Command as orchestrator

Use commands for:

- Batch operations across many skills (`/meta:skills-eval`)
- Fixed output templates (audit reports)
- Arguments and tool restrictions (`allowed-tools`)

Keep orchestration in the command; keep reusable knowledge in skills.

### Plugin README as map

List skills under Components with one-line scope. The README is the human-facing
facade; avoid a separate "index" skill unless triggers require it.

## Splitting Heuristics

| Signal | Action |
| --- | --- |
| `description` exceeds ~200 words of triggers | Split by user intent |
| `SKILL.md` > 500 lines | Move sections to `references/` or split skills |
| Two unrelated workflows in one H2 section | New skill or reference file |
| Same checklist in skill and command | Keep in one reference; link from both |
| "Also handles X, Y, Z" in prose | X, Y, Z are probably separate skills |

## Anti-Patterns

- **God skill** — One skill for an entire plugin domain (e.g. "all of git")
- **Shadow skill** — Duplicate of another skill with tweaked triggers
- **README skill** — `SKILL.md` that only lists siblings; use plugin README
- **Inline encyclopedia** — API docs and schemas in `SKILL.md` instead of `references/`
- **Circular handoffs** — A → B → A without a clear termination condition

## Example: Meta Plugin Shape

```text
skill-development          # Author SKILL.md
modular-skill-framework    # Boundaries and composition (this skill)
plugin-structure           # Plugin layout and marketplace registration
command-development        # Slash commands
hook-development           # hooks.json and events
```

Triggers are disjoint; commands (`audit-skill`, `skills-eval`) orchestrate
audits without replacing authoring skills.
