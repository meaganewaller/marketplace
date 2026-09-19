---
name: debug-recap
description: >
  Summarizes an existing debugging session's state for resuming after a
  break or handing off to a teammate -- what's been ruled out, what's
  currently being tested, and what's next. Use this skill when the user
  asks to resume a debugging session, says "where did I leave off," "catch
  me up on [bug]," "hand this off to [someone]," lists multiple active
  sessions and asks which is which, or runs "/debug resume".
---

# Debug Recap

## Resuming a session

1. If the user names a session (by id or a rough description of the
   symptom), find the matching file in `data/sessions/`. If ambiguous
   (multiple active sessions could match), list them briefly and ask which.
2. Render using the format in `../debug-session/references/status-format.md`,
   including the "Picking this back up" gap line.
3. If `status` is `active` and it's been more than a few days since
   `updated`, gently flag that the trail might be stale -- e.g. code may
   have changed since the last hypothesis was tested -- rather than assuming
   everything logged is still accurate.

## Handing off to someone else

Same rendering, but written to be read by someone with no prior context:
expand the symptom line slightly (environment, when it started) and make
sure ruled-out hypotheses include *why*, not just that they were ruled out --
the point is to stop the next person from re-testing them.

## Listing active sessions

If the user has multiple sessions and doesn't specify one, list all
`status: "active"` sessions from `data/sessions/` with just the symptom and
last-updated time, and ask which to recap in full.
