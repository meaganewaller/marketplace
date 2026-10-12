---
description: "Near-miss for pr-review-copilot:review-diff. Splitting a diff is git-workflow:split-pr even though review is mentioned."
tags: [near-miss, review-diff]
plugins: ["../../..", "../../../../git-workflow"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

My diff is too big for anyone to review. Propose how to split it into smaller PRs.
