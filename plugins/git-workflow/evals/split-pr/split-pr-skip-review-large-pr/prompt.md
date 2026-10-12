---
description: "Near-miss for git-workflow:split-pr. Size is mentioned but the ask is a review, which is pr-review-copilot:review-diff."
tags: [near-miss, split-pr]
plugins: ["../../..", "../../../../pr-review-copilot"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Here's a large PR, https://github.com/acme/web/pull/91. Review it and tell me what's wrong with it.
