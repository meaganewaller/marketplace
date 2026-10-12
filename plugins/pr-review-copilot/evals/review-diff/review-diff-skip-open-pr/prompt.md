---
description: "Near-miss for pr-review-copilot:review-diff. \"Ready for review\" means create a PR (git-workflow:pr), not run a review."
tags: [near-miss, review-diff]
plugins: ["../../..", "../../../../git-workflow"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

My branch is ready for review. Open a pull request so the team can look at it.
