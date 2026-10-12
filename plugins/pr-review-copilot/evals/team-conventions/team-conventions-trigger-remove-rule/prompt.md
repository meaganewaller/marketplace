---
description: "Should trigger pr-review-copilot:team-conventions."
tags: [trigger, team-conventions]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Remove the review rule that requires JSDoc on private functions, we dropped that.
