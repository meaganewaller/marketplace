---
description: "Should trigger debug-session-tracker:debug-session."
tags: [trigger, debug-session]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Let's debug this: users get logged out roughly every ten minutes, but only in staging.
