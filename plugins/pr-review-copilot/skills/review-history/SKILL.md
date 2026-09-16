---
name: review-history
description: >
  Logs findings from each review into the project's
  .claude/pr-review-history.local.json and checks new findings against past
  ones, so a pattern that keeps recurring for a repo or author gets flagged
  as a recurring issue (worth a lint rule or a team convention) rather than
  treated as a fresh one-off every time. Use this skill after review-diff
  produces findings, or when the user asks "has this come up before," "is
  this a recurring issue," or wants a summary of recurring findings for a
  repo or author.
---

# Review History

`.claude/pr-review-history.local.json` in the project being reviewed is a
lightweight, append-only log. Resolve it against the repo root
(`git rev-parse --show-toplevel`), or the working directory outside a git
repo. It lives in the project rather than this plugin's directory because
plugin updates install each version into a fresh directory, so anything
saved inside the plugin is lost on the next release.

It is not a replacement for the actual review documents -- it exists only to
detect recurrence. It is personal to the reviewer and names PR authors, so it
stays out of git.

## Logging (after a review-diff run)

For each finding in the generated review, append an entry:

```json
{
  "date": "2026-09-15",
  "repo": "acme/api",
  "author": "octocat",
  "file": "routes/export.py",
  "category": "Security",
  "pattern": "missing-ownership-check",
  "severity": "Blocking"
}
```

`pattern` should be a short, stable slug you choose to represent the kind of
issue (e.g. `missing-ownership-check`, `n-plus-one-query`,
`unclear-naming`) -- consistent enough that the same underlying issue gets
the same slug across reviews, so recurrence is detectable.

If `.claude/pr-review-history.local.json` doesn't exist yet, create it (and
`.claude/` if needed) as an empty JSON array before appending. Inside a git
repo, then run `git check-ignore -q .claude/pr-review-history.local.json`
from the repo root; if it exits 1, git is not ignoring the file, so tell the
user it names PR authors and suggest adding `.claude/*.local.json` to
`.gitignore`.

## Checking recurrence (during a review-diff run)

Before finalizing a finding, check whether the same `pattern` has appeared
for this `repo` (or `author`, if repo isn't a strong enough signal) in the
last ~90 days of history. If so:

- Note the recurrence in that finding's "Reasoning" in the review document,
  e.g. "This is the 3rd time this pattern has come up in this repo this
  quarter -- might be worth a lint rule or a team convention instead of a
  per-PR comment."
- Do not change the finding's severity solely because it recurred -- recurrence
  is a signal about process, not a reason to escalate an individual finding.

## Summarizing recurrence (on request)

When asked for a recurrence summary (e.g. "what keeps coming up in acme/api"),
group `.claude/pr-review-history.local.json` entries by `pattern`, count
occurrences, and present the most frequent ones first. This is meant to
surface candidates for lint rules, conventions, or team discussion -- not to
single out an author.
