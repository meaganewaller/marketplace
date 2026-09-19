---
name: debug-session
description: >
  Starts, updates, and closes a debugging session log stored in
  data/sessions/*.json -- tracking the symptom, each hypothesis tried with
  its status (untested/testing/ruled-out/confirmed) and supporting evidence,
  and next steps. Use this skill whenever the user is working a hard or
  confusing bug and wants to track what's been tried, says things like
  "let's debug this," "start tracking this bug," "I think it might be X,"
  "that wasn't it," "rule that out," "here's what I found," or "/debug
  start" / "/debug log" / "/debug status". Prevents re-testing the same
  hypothesis twice during a long session.
---

# Debug Session

One JSON file per session in `data/sessions/`, named `<slug>-<date>.json`
(e.g. `checkout-500s-2026-09-17.json`). Only one session should be "active"
at a time unless the user explicitly says they're tracking two in parallel.

## Session schema

```json
{
  "id": "checkout-500s-2026-09-17",
  "status": "active",
  "symptom": "Checkout returns 500 intermittently under load",
  "environment": "prod, us-east, started ~14:00 UTC",
  "started": "2026-09-17T14:20:00Z",
  "updated": "2026-09-17T15:05:00Z",
  "hypotheses": [
    {
      "id": 1,
      "claim": "DB connection pool exhausted under load",
      "status": "ruled-out",
      "evidence": "Pool metrics show 40/100 connections in use during the spike -- not exhausted",
      "logged": "2026-09-17T14:35:00Z"
    },
    {
      "id": 2,
      "claim": "Retry logic in payment client is double-charging and timing out on the second call",
      "status": "testing",
      "evidence": "Payment client logs show 2 calls per failed checkout in 3/3 sampled cases",
      "logged": "2026-09-17T15:05:00Z"
    }
  ],
  "next_steps": ["Check if retry logic has a dedup key", "Ask payments team if double-call is expected under timeout"]
}
```

Hypothesis `status` values: `untested`, `testing`, `ruled-out`, `confirmed`.

## Starting a session

1. Ask (or infer from context) the symptom in one sentence and, if relevant,
   the environment/timing.
2. Create the JSON file with `status: "active"`, the symptom, empty
   `hypotheses` and `next_steps`.
3. Confirm back to the user with the session id, so they can reference it later.

## Logging during a session

When the user proposes a hypothesis, reports a test result, or shares
findings:

1. **Before adding a new hypothesis**, check existing entries in this
   session for a matching or near-matching `claim`. If one already exists
   and was ruled out, say so plainly instead of logging a duplicate --
   this is the core value of the skill.
2. New hypothesis → append with `status: "untested"` or `"testing"` depending
   on phrasing, and any evidence already mentioned.
3. Update on an existing hypothesis ("that wasn't it," "confirmed it") →
   update its `status` and append to `evidence` rather than overwriting it,
   so the reasoning trail stays intact.
4. Update the session's `next_steps` when the user states or implies what to
   try next.
5. Bump `updated` on every write.

Keep evidence entries factual and specific (numbers, log lines, what was
observed) -- not conclusions. Conclusions belong in `status`.

## Checking status

On "/debug status" or "where are we on this," render the current session as
a short summary: symptom, hypotheses grouped by status, next steps. Use
`references/status-format.md` for the exact layout.

## Closing a session

When the bug is fixed or the user says to close it:

1. Set `status` to `"resolved"` (confirmed root cause found) or
   `"abandoned"` (stopped without resolution -- still valuable to keep, so
   the ruled-out hypotheses aren't retried in a future session).
2. Ask for a one-line root cause and fix summary if resolved; append to the
   file as `resolution`.
3. Hand off to `debug-patterns` to log the root cause for recurrence tracking
   (only when resolved -- abandoned sessions have no confirmed cause to log).
4. Offer to generate a short writeup (symptom, root cause, fix, and what
   made it hard to find) -- useful as a postmortem seed or a note for
   teammates, not required.

See `references/status-format.md` for the status/recap rendering format.
