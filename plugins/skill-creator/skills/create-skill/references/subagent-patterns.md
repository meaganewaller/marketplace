# Subagent Patterns

Use `context: fork` to run a skill in an isolated subagent. The skill content becomes
the subagent's prompt. The subagent runs independently and returns its result to the
main conversation.

## When to Use Subagents

- **Research tasks** — gathering information without cluttering main context
- **Large analysis** — processing many files without consuming context budget
- **Isolated operations** — tasks that shouldn't affect the main conversation state

## Agent Types

| Type | Best For |
| --- | --- |
| `Explore` | Codebase exploration, searching, reading files |
| `Plan` | Architecture planning, design decisions |
| `general-purpose` | Multi-step tasks requiring all tools |
| Custom agents | Specialized behavior defined in plugin `agents/` |

## Examples

### Research Agent

```yaml
---
name: find-usage
description: Find all usages of a function or type across the codebase
context: fork
agent: Explore
---

Find all usages of `$ARGUMENTS` in the codebase.

1. Use Grep to find direct references
2. Use Glob to find files that might contain indirect usage
3. Read relevant files to understand usage patterns
4. Report: where it's used, how it's used, and any patterns
```

### Planning Agent

```yaml
---
name: plan-refactor
description: Plan a refactoring strategy for a module
context: fork
agent: Plan
---

Plan a refactoring strategy for: $ARGUMENTS

1. Read the current implementation
2. Identify coupling and dependencies
3. Propose a step-by-step refactoring plan
4. Highlight risks and suggest mitigations
```

### Full-Capability Agent

```yaml
---
name: fix-and-test
description: Fix a failing test and verify the fix
context: fork
agent: general-purpose
---

Fix the failing test: $ARGUMENTS

1. Run the test to see the failure
2. Read the test and source code
3. Fix the issue
4. Re-run the test to verify
5. Report what was changed and why
```

## Notes

- Subagents have their own context window — they don't see the main conversation
- Results are returned as a single message to the main conversation
- Subagents can use tools based on their `allowed-tools` or agent type defaults
- Use `allowed-tools` to restrict what the subagent can do for safety
