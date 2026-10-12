---
description: "Near-miss for git-workflow:issue. Working a bug is debug-session-tracker:debug-session, not filing an issue."
tags: [near-miss, issue]
plugins: ["../../..", "../../../../debug-session-tracker"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Let's debug this: checkout returns a 500 intermittently, but only under load.
