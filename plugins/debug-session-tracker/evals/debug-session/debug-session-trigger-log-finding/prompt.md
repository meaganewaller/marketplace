---
description: "Should trigger debug-session-tracker:debug-session."
tags: [trigger, debug-session]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Log this to the debug session: bumping the session TTL to 30 minutes made no difference, still logged out at ten.
