---
name: adr-writing
description: Writing Architecture Decision Records for the dotfiles repo in the existing format — numbered NNNN-slug.md files under docs/adrs/, with Context/Decision/Consequences sections and an entry in docs/adrs/README.md. Triggers on "write an ADR", "architecture decision record", "ADR for dotfiles", "docs/adrs", "decision record", "0001-specialized-agent-shell".
---

# ADR writing

The dotfiles use ADRs to capture decisions that future-you (or another contributor) would otherwise have to reverse-engineer. They live under `docs/adrs/` and follow a consistent format.

## When to write one

Write an ADR for decisions that are:

- **Hard to reverse** — once committed, undoing requires significant churn
- **Surprising to a reader** — the obvious approach was rejected for non-obvious reasons
- **Cross-cutting** — touches multiple files / skills / scripts
- **Explicitly traded off** — you considered alternatives and picked one

Don't write an ADR for:

- Tactical refactors with no decision (just commit message it)
- Reversible style choices
- "Add a new package" decisions (let the package manifest speak)
- Implementation bugs you fixed

## Naming

Sequential numbering, zero-padded to 4 digits, kebab-case slug:

```text
docs/adrs/
├── README.md
├── 0001-specialized-agent-shell.md
├── 0002-tmux-plugins-via-chezmoi-externals.md
├── 0003-mise-config-plus-lockfile.md
├── 0004-claude-settings-management.md
└── 0005-universal-theme-switcher.md
```

Next available number is `0006-...`. Find it with:

```bash
ls docs/adrs/*.md | grep -oE '^docs/adrs/[0-9]{4}' | sort -r | head -1
```

## Template

```markdown
# NNNN. Short imperative title

**Status:** Accepted | Proposed | Superseded by [NNNN](nnnn-slug.md)
**Date:** YYYY-MM-DD

## Context

What's the situation that demanded a decision? Be concrete about the constraints — what the existing setup did, what was breaking or limiting, who else is affected. Future-you needs to recognize when this context still applies.

## Decision

What was decided. One sentence first, then elaboration. Be specific enough that someone could implement it from this section alone.

## Alternatives considered

What else was on the table? Why was it rejected? A table or short list:

| Alternative | Why rejected |
| --- | --- |
| Approach A | Couldn't satisfy constraint X |
| Approach B | Worked, but added complexity that wasn't justified |

## Consequences

### Good

- ...

### Bad / trade-offs

- ...

### Neutral

- ...

## Revisit when

Under what conditions should this be reopened? A signal that the decision no longer holds — new tooling, scale change, a constraint going away.

## References

- Related ADRs: [NNNN](nnnn-slug.md)
- Code: `home/...`
- External: links to docs/issues/discussions
```

## After writing the file

1. Add an entry to `docs/adrs/README.md` (the index). Keep it chronological.
2. Cross-link from any affected file:
   - `AGENTS.md` if the decision changes agent behavior
   - The relevant `home/...` template/script via a comment
   - Other ADRs that this one supersedes or builds on
3. Commit with `docs(adr):` prefix: `docs(adr): add 0006 for X decision`.

## Reading order for new readers

The dotfiles' ADRs are designed to be readable in numeric order. ADR 0001 establishes the agent-vs-human shell split that later ADRs build on. When proposing 0006, make sure the assumptions you carry over from 0001–0005 are still true; if not, mark the relevant earlier ADR as **Superseded by 0006** and note the supersession in 0006's status line.

## Tone

ADRs are **prose**, not bullet-point dumps. They should read like a memo:

- Active voice ("We chose X because…")
- Past tense for decisions ("decided", not "decide")
- Present tense for current state ("the agent shell is minimal")
- No marketing language — say what was traded off, not just what was gained

## Related

- [docs/adrs/README.md](https://github.com/meaganewaller/dotfiles/blob/main/docs/adrs/README.md) — index
- [[chezmoi-workflow]] — many ADRs reference the workflow
- Existing ADRs as style references (ADR 0001 is the canonical example)
