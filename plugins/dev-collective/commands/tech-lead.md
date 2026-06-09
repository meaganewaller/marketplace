---
description: Break down a task into a sequenced work plan with role assignments
argument-hint: <task to plan and break down>
---

# Tech Lead

Produce a work breakdown, sequencing, and role assignments for a given task.

## Usage

```text
/dev-collective:tech-lead Implement multi-tenancy support across the billing module
/dev-collective:tech-lead Migrate the search service from Elasticsearch to Typesense
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to understand the task scope, goals, and any stated constraints (timeline, affected systems, required languages).

2. Launch the `dev-collective:tech-lead` agent and apply the `implementation-workflow` skill to produce a structured work breakdown.

3. The agent must deliver:

   - **Goal statement**: one or two sentences restating the task in engineering terms
   - **Work breakdown**: a numbered list of discrete work items, each with:
     - A short title
     - A brief description of what must be done and why
     - The recommended role from the language-expert roster (`rails-engineer`, `python-engineer`, `rust-engineer`, `go-engineer`, or `bash-engineer`) or a strategic role where appropriate
     - An estimated relative size (small / medium / large)
   - **Sequencing**: a dependency graph or ordered phases showing which items can proceed in parallel and which are blocked by prior work
   - **Risk flags**: any items that carry meaningful technical risk, along with a suggested mitigation
   - **Open questions**: blockers or unknowns that must be resolved before work can begin

4. If the task description is ambiguous, the agent should state its assumptions explicitly before producing the plan rather than asking clarifying questions.

5. Return the complete plan as the command output, formatted for direct use as a sprint or project brief.
