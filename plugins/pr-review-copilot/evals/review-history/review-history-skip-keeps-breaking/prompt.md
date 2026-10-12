---
description: "Near-miss for pr-review-copilot:review-history. Recurring root causes across debugging sessions are debug-patterns."
tags: [near-miss, review-history]
plugins: ["../../..", "../../../../debug-session-tracker"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

What keeps breaking across our debugging sessions this quarter?
