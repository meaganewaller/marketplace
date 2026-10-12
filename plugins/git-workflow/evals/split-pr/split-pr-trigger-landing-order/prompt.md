---
description: "Should trigger git-workflow:split-pr."
tags: [trigger, split-pr]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Suggest how to carve the current changes into separate pull requests and what order to land them in.
