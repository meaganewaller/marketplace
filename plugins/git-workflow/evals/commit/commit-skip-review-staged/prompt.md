---
description: "Near-miss for git-workflow:commit. Reviewing changes is pr-review-copilot:review-diff even when the word commit appears."
tags: [near-miss, commit]
plugins: ["../../..", "../../../../pr-review-copilot"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Before I commit anything, review my staged changes and tell me what's wrong with them.
