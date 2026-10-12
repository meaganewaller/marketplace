---
description: "Near-miss for pr-review-copilot:review-history. Recurring bugs (not review findings) are debug-session-tracker:debug-patterns."
tags: [near-miss, review-history]
plugins: ["../../..", "../../../../debug-session-tracker"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Has this kind of bug happened before? Prod is double-charging on retries again.
