---
description: "Near-miss for debug-session-tracker:debug-patterns. Recurring review findings are pr-review-copilot:review-history, not bug patterns."
tags: [near-miss, debug-patterns]
plugins: ["../../..", "../../../../pr-review-copilot"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Is missing error handling a recurring finding in code reviews for this repo?
