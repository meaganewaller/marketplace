---
description: "Should trigger debug-session-tracker:debug-patterns."
tags: [trigger, debug-patterns]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Found it: the retry logic re-sent the request without a dedup key. Close the checkout session as resolved.
