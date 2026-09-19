---
name: debug-patterns
description: >
  Logs confirmed root causes to data/patterns.json when a debugging session
  resolves, and surfaces recurring root-cause patterns across sessions (e.g.
  "this is the 3rd retry-logic double-call bug this quarter"). Use this
  skill when a session in debug-session is closed as resolved, or when the
  user asks "has this kind of bug happened before," "what keeps breaking,"
  or wants a summary of recurring root causes across sessions.
---

# Debug Patterns

`data/patterns.json` is an append-only log, written to only when a session
resolves with a confirmed root cause. It exists to catch recurring *classes*
of bugs -- not to duplicate the session files themselves.

## Logging on resolution

When `debug-session` closes a session as `resolved`, append:

```json
{
  "date": "2026-09-17",
  "session_id": "checkout-500s-2026-09-17",
  "pattern": "retry-double-call",
  "root_cause": "Retry logic re-sent payment request without a dedup key, causing a second charge attempt to time out under load",
  "area": "payments"
}
```

Choose `pattern` as a short, stable slug representing the underlying class
of bug (e.g. `retry-double-call`, `n-plus-one-query`, `race-condition-cache`)
-- consistent enough that the same underlying issue gets the same slug
across sessions, the same way `review-history` does in the PR-review plugin.

## Surfacing recurrence

When asked what keeps coming up, or before starting a new session, check
`data/patterns.json` for prior entries with a similar `pattern` or `area`.
If the new symptom looks related to a past pattern:

- Mention it early in the session ("this looks similar to the
  retry-double-call bug from [date] in [session_id] -- worth checking that
  angle first") rather than waiting until the end.
- Do not assume it's the same bug -- offer it as a lead, not a conclusion.

## Summarizing on request

Group `data/patterns.json` by `pattern`, count occurrences, and present most
frequent first, with the areas they cluster in. This is meant to surface
candidates for a fix at the root (a lint rule, a shared library change, a
design review) rather than continuing to patch each instance individually.
