---
description: "Near-miss for pr-review-copilot:review-diff. Mentions a diff but asks for a commit."
tags: [near-miss, review-diff]
plugins: ["../../..", "../../../../git-workflow"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Commit my staged diff with a conventional commit message.
