# Debugging Session Tracker

Tracks what's been tried during a hard bug hunt -- hypotheses, their status,
and the evidence behind each -- so nothing gets re-tested, a session can be
picked back up cleanly after a break, and recurring root causes surface
across sessions over time.

## What's in this plugin

- **`skills/debug-session`** -- the core skill. Start a session, log
  hypotheses and their status (untested/testing/ruled-out/confirmed) with
  evidence, check status mid-session, close it out.
- **`skills/debug-recap`** -- summarize a session's state for resuming after
  a break or handing off to a teammate with no prior context.
- **`skills/debug-patterns`** -- logs confirmed root causes on resolution and
  flags when a new bug looks like a recurring pattern.

## Using it

Just describe what's happening, in plain language:

- "Let's debug this -- checkout is 500ing under load" starts a session
- "I think it might be the connection pool" logs a hypothesis
- "Nope, pool's fine, 40/100 connections in use" rules it out with evidence
- "Where are we on this?" / "/debug status" recaps the current state
- "Catch me up on the checkout bug" / "/debug resume" picks it back up
- "This is fixed -- it was the retry logic double-charging" closes it out
  and logs the root cause

## Data files

- `data/sessions/*.json` -- one file per session, created as you go.
- `data/patterns.json` -- append-only log of confirmed root causes, written
  only when a session resolves. Grows over time; no cleanup step built in
  yet, prune manually if it gets large.

## Known limitations (v0.1.0)

- Single-session assumption by default -- if you're tracking two bugs in
  parallel, be explicit about which session you mean when logging.
- Pattern recurrence depends on consistent slug naming across sessions --
  a best-effort signal, not a guarantee.
- No automatic staleness check beyond a simple "time since last update" --
  it won't know if the code itself has changed underneath a ruled-out
  hypothesis.
