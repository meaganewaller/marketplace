---
description: "Should trigger debug-session-tracker:debug-session. Closing a session belongs to debug-session, which hands off to debug-patterns only once the session file is closed."
tags: [trigger, debug-session]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Found it: the retry logic re-sent the request without a dedup key. Close the checkout session as resolved.
