---
description: Dispatch any task to the right team — roles, phases, and sequencing chosen automatically
argument-hint: <task or goal>
---

# Assemble

Route a task to the right combination of agents, in the right order, and synthesize a unified result.

## Usage

```text
/dev-collective:assemble Add a Redis-backed rate limiter to the API gateway
/dev-collective:assemble Evaluate whether to build our own auth service or adopt an off-the-shelf solution
/dev-collective:assemble Refactor the order pipeline to be fully async and add observability
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to understand the full task or goal. Extract the primary intent, scope signals (single file vs. system-wide), and any explicit constraints (language, deadline, risk tolerance).

2. Apply the `team-orchestration` skill to analyze the task and produce a **team plan** — a structured list of:
   - Roles needed (drawn from the full roster: `rails-engineer`, `python-engineer`, `rust-engineer`, `go-engineer`, `bash-engineer`, `cto`, `principal-architect`, `staff-engineer`, `tech-lead`, `product-manager`, `code-reviewer`, `qa-engineer`, `sre`, `security-engineer`)
   - Lifecycle phases required (drawn from: `discovery`, `technical-design`, `implementation-workflow`, `code-review-process`, `shipping`)
   - Dependency ordering — which phases must complete before the next begins, and which can run in parallel

3. **Right-size the team.** A one-file bug fix may need only a single `rails-engineer`. A greenfield system may need `principal-architect` → `tech-lead` → language experts in parallel → `code-reviewer` + `security-engineer` → `sre`. Never inflate the team beyond what the task genuinely requires.

4. Present the chosen team and plan to the user **before executing**, in this format:

   ```text
   Team assembled for: <task summary>

   Roles:      <comma-separated list>
   Phases:     <ordered list with parallel groups shown as [A + B] and sequential steps as A → B>
   Rationale:  <one sentence explaining the routing decision>

   Proceeding…
   ```

5. Execute the plan phase by phase:

   a. **Discovery phase** (if needed): Launch `dev-collective:tech-lead` with the `discovery` skill to clarify unknowns, surface assumptions, and confirm scope before design work begins.

   b. **Design phase** (if needed): Launch `dev-collective:principal-architect` with the `technical-design` skill. For high-uncertainty areas, also launch `dev-collective:staff-engineer` in parallel.

   c. **Planning phase** (if needed): Launch `dev-collective:tech-lead` with the `implementation-workflow` skill to produce a work breakdown and role assignments.

   d. **Implementation phase** (if needed): Launch the required language-expert agents (`dev-collective:rails-engineer`, `dev-collective:python-engineer`, etc.) in parallel, each scoped to their assigned work items from the plan.

   e. **Review phase** (if needed): Launch `dev-collective:code-reviewer` with the `code-review-process` skill. For changes touching auth, secrets, data handling, or infrastructure, also launch `dev-collective:security-engineer` in parallel.

   f. **Shipping phase** (if needed): Launch `dev-collective:sre` with the `shipping` skill (alongside `dev-collective:tech-lead`) to produce a release-readiness assessment.

6. After all phases complete, synthesize the agents' outputs into a single cohesive response organized by phase. Resolve any contradictions between agents explicitly. Highlight action items, open questions, and recommended next steps.

7. If at any point an agent surfaces a blocker or critical unknown that changes the plan, pause, re-apply the `team-orchestration` skill to revise the plan, and present the updated plan before continuing.
