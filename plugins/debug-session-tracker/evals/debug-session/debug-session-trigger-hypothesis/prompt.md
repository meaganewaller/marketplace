---
description: "Should trigger debug-session-tracker:debug-session."
tags: [trigger, debug-session]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Still on the staging logout bug. I think it might be the session cookie's SameSite setting. Log that as a hypothesis.
