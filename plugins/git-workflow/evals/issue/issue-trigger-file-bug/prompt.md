---
description: "Should trigger git-workflow:issue."
tags: [trigger, issue]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

File a bug: the CSV export drops any row whose customer name has non-ASCII characters.
