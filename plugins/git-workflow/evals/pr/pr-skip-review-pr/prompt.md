---
description: "Near-miss for git-workflow:pr. Reviewing someone else's PR is pr-review-copilot:review-diff, not creating one."
tags: [near-miss, pr]
plugins: ["../../..", "../../../../pr-review-copilot"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Review PR https://github.com/acme/api/pull/482 before I merge it.
