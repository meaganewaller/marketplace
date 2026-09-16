# Output Template

````markdown
# PR Review: [PR title]
**Link:** [url or "pasted diff, no link provided"]  **Reviewed:** [date]

## Understanding
[2-4 sentences on what this PR changes, inferred/stated intent, and whether
implementation matches intent. Flag mismatches here.]

## Findings Summary

| # | File:Line | Severity | Category | Summary |
|---|-----------|----------|----------|---------|
| 1 | auth.py:142 | Blocking | Security | Missing input validation on token param |
| 2 | orders.py:88 | Should-fix | Performance | N+1 query in loop |

(If no findings: state that plainly instead of an empty table.)

## Finding Details

### #1 — auth.py:142 [Blocking / Security]
**Reasoning:** [the mechanism of the bug/risk -- why it matters, not just
that it's bad. If review-history shows this is a recurring pattern for this
author/repo, say so here.]

**Draft comment** (reword before posting):
> [1-3 sentence comment written as feedback to the author. Reviewer will
> rewrite it in their own voice before posting -- never imply this has
> been or will be posted automatically.]

**Suggested fix** (only if unambiguous):
```diff
- old_line
+ new_line
```

---
[repeat per finding, in the same order as the summary table]
````

## Worked example

Given a diff that adds a new `/export` endpoint pulling a user's records by
ID from a query param with no ownership check:

````markdown
# PR Review: Add CSV export endpoint
**Link:** https://github.com/acme/api/pull/482  **Reviewed:** 2026-09-15

## Understanding
Adds a GET /export endpoint that streams a user's records as CSV, keyed off
a `user_id` query param. Matches the PR description ("self-serve data
export"). No tests were added for the new route.

## Findings Summary

| # | File:Line | Severity | Category | Summary |
|---|-----------|----------|----------|---------|
| 1 | routes/export.py:22 | Blocking | Security | No check that requester owns user_id |
| 2 | routes/export.py:35 | Should-fix | Performance | Loads all records into memory before streaming |
| 3 | routes/export.py | Nit | Maintainability | No test coverage for the new route |

## Finding Details

### #1 — routes/export.py:22 [Blocking / Security]
**Reasoning:** `user_id` comes straight from the query string and is used to
fetch records with no comparison against the authenticated session's user.
Any authenticated user can read any other user's export by changing the
query param -- an IDOR (insecure direct object reference).

**Draft comment** (reword before posting):
> This pulls records for `user_id` from the query param without checking it
> matches the authenticated user -- looks like it'd let anyone export anyone
> else's data by changing the param.

**Suggested fix**:
```diff
- records = db.get_records(user_id)
+ records = db.get_records(current_user.id)
```

### #2 — routes/export.py:35 [Should-fix / Performance]
**Reasoning:** `db.get_records()` returns the full list before the response
starts streaming, so large exports will spike memory and delay time-to-first-byte.
No suggested fix included -- switching to a generator/cursor-based stream is
a bigger change than a one-line patch and depends on the ORM's streaming API.

**Draft comment** (reword before posting):
> This loads the full record set into memory before streaming starts --
> might be worth switching to a cursor-based stream for large accounts.

---
````
