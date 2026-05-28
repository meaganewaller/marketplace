---
description: Scaffold the next-numbered ADR under docs/adrs/ in the existing format
---

# /dotfiles-new-adr

Creates a new Architecture Decision Record file with the next sequential number and updates the index.

## Steps

1. **Resolve repo path** via the **dotfiles-config** skill.

2. **Find the next ADR number:**

```bash
cd "<repo_path>"
ls docs/adrs/[0-9][0-9][0-9][0-9]-*.md 2>/dev/null \
  | grep -oE '/[0-9]{4}' | tr -d '/' | sort -n | tail -1
```

Increment by 1, zero-pad to 4 digits. If no existing ADRs, start at `0001`.

1. **Ask the user** with `AskUserQuestion`:

   - **Title** — short imperative phrase (e.g. `Specialized agent shell`, `Mise config plus lockfile`). Will be kebab-cased for the filename.
   - **Status** — `Proposed` (default) or `Accepted`. Use `Proposed` if there's review/discussion expected; `Accepted` if the decision is already in effect.

2. **Generate the file** at `docs/adrs/NNNN-<kebab-title>.md` using the format from the **adr-writing** skill (Context, Decision, Alternatives, Consequences, Revisit when). Fill in `## Date:` with today's date.

3. **Add an entry to `docs/adrs/README.md`** — keep chronological order. The new entry goes at the bottom of the list:

```markdown
- [NNNN. Title](NNNN-<kebab-title>.md) — Status, YYYY-MM-DD
```

1. **Tell the user:**

   - Path to the new ADR
   - The remaining sections they need to fill in (Context, Decision, Alternatives, Consequences)
   - That cross-links from `AGENTS.md` or affected source files may be needed (the **adr-writing** skill covers this)
   - Commit prefix: `docs(adr): add NNNN for <short title>`

## Notes

- The **adr-writing** skill is the source of truth for tone, structure, and what makes a good ADR vs a commit message. This command scaffolds — the user (or a follow-up agent invocation) writes the content.
- Don't auto-fill the Context / Decision sections from conversation history without explicit user direction. ADRs are deliberate; fabricated reasoning is worse than a blank section.
