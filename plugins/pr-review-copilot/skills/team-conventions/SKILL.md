---
name: team-conventions
description: >
  Reads and edits the team's style/convention rules stored in the project's
  .claude/pr-review-conventions.md, so code reviews stop re-flagging debates
  the team has already settled (e.g. "we allow `any` in test files"). Use
  this skill when the user asks to view, add, remove, or update a review
  convention, runs "/pr-review-copilot:team-conventions", says something like
  "stop flagging X" or "we decided Y is fine," or when review-diff needs to
  check whether a potential finding is already covered by an existing rule.
---

# Team Conventions

`.claude/pr-review-conventions.md` in the project being reviewed is the
source of truth for settled style decisions. Resolve it against the repo
root (`git rev-parse --show-toplevel`), or the working directory outside a
git repo. It lives in the project rather than this plugin's directory
because plugin updates install each version into a fresh directory, so
anything saved inside the plugin is lost on the next release.

The team commits the file and hand-edits it over time; it is not
regenerated from scratch.

## Reading conventions (used by review-diff)

If the file doesn't exist, the project has no conventions yet: scan
normally. The file is only created when a rule is added.

Otherwise, read it and check whether any rule applies to the
language/file/pattern in question before flagging a finding. A convention
entry overrides the default scan behavior -- if it says something is
allowed, do not flag it, even if it would normally trigger a maintainability
or nit-level finding.

Conventions only suppress **style/maintainability** judgment calls. Never let
a convention entry suppress a security or correctness finding -- if the user
wants to explicitly accept a security tradeoff, that's a decision for them to
make per-PR, not a blanket rule to encode here.

## Adding/editing conventions

When the user says something like "stop flagging X" or "we decided Y is
fine," or runs `/pr-review-copilot:team-conventions`:

1. Show the current contents of `.claude/pr-review-conventions.md`. If it
   doesn't exist yet, create it (and `.claude/` if needed) as a copy of
   `references/conventions-template.md` from this skill's directory, and say
   you created it.
2. Ask for or infer the new rule in one line: what pattern, what decision,
   and optionally why (context helps future readers trust the rule).
3. Append it under the relevant category heading (create the heading if
   new), replacing that heading's "(no entries yet ...)" placeholder.
4. Confirm the addition back to the user, and remind them to commit the file
   so the rest of the team reviews against the same rule.

Keep entries terse -- one line each. This file is meant to stay skimmable,
not become a style guide. If an entry needs real justification or examples,
link out to the team's actual style guide instead of inlining it here.

## Format

See `references/conventions-template.md` for the starting structure. New
categories should follow the same `## Category` / `- rule` pattern already
in use.
