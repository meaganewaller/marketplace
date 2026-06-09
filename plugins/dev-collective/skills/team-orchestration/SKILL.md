---
name: team-orchestration
description: THE ROUTER. Given any engineering task, decide which roles and lifecycle phases apply, in what order, and whether to run them sequentially or in parallel. Use when someone says "assemble the team", "who should work on this", "route this task", "what roles do I need", or invokes the /dev-collective:assemble command. Handles right-sizing so a one-line fix does not spin up the whole org.
---

# Team Orchestration

Team orchestration is the meta-skill that sits above all other dev-collective lifecycle phases. Given a task description, it selects the minimum viable set of roles and phases, sequences them correctly, and launches the appropriate subagents.

## When to Use This Skill

- User says "assemble the team", "who should work on this", or "route this task"
- User runs `/dev-collective:assemble`
- Any task that is ambiguous about which phase to start in
- Multi-phase work where the right sequence is unclear

## Routing Table

Map the strongest signal in the task description to the recommended starting point.

```text
Signal                              Primary Role(s)              Phase(s)
─────────────────────────────────────────────────────────────────────────────
"what should we build / why"        product-manager              discovery
"how should we design / architect"  principal-architect          technical-design
                                    staff-engineer
"implement / build / code this"     tech-lead + lang expert      implementation-workflow
"review / check this PR"            code-reviewer                code-review-process
                                    security-engineer (if auth,
                                    payments, secrets touched)
"ship / deploy / release"           sre + tech-lead              shipping
"bug in production"                 sre → tech-lead              shipping → implementation-workflow
"security concern"                  security-engineer            technical-design + code-review-process
"performance problem"               staff-engineer + sre         technical-design → implementation-workflow
"greenfield feature"                product-manager →            discovery → technical-design →
                                    principal-architect →        implementation-workflow →
                                    tech-lead + lang expert      code-review-process → shipping
```

## Right-Sizing Guide

Not every task needs the full org. Apply the minimum necessary roles.

```text
Task size         Roles needed
───────────────────────────────────────────────────────────
Typo / 1-liner    lang expert only (skip all lifecycle phases)
Small bug fix     tech-lead + lang expert + code-reviewer
Feature (<1 day)  tech-lead + lang expert + code-reviewer + sre sign-off
Feature (>1 day)  discovery + technical-design + full pipeline
New system        Full pipeline, all strategic roles in design
Security patch    security-engineer leads; code-reviewer required; sre for deploy
```

## Sequential vs. Parallel Execution

Run phases **sequentially** when:

- Output of one phase is required input for the next (e.g., acceptance criteria feed design)
- A blocking decision has not been made yet

Run roles **in parallel** when:

- Multiple independent workstreams exist (e.g., backend and frontend implementation)
- Review roles can operate alongside implementation (e.g., security review while feature branches merge)

## Process

1. Read the task description and identify the strongest signal from the routing table above.
2. Determine task size and apply the right-sizing guide.
3. Identify which lifecycle phases are needed, in order.
4. For each phase, identify the owning role and any supporting roles.
5. Decide which steps can run in parallel vs. must be sequential.
6. Launch subagents: invoke the matching lifecycle skill (e.g., `dev-collective:discovery`) with the task context as input.
7. Pass outputs from each phase as context into the next phase.
8. Surface a summary of the routing plan to the user before execution if the plan involves more than two roles.

## Outputs

- A routing plan: ordered list of phases, roles, and execution mode (sequential/parallel)
- Delegated subagent invocations for each phase
- A final synthesis once all phases complete

## Delegating to Subagents

When launching a subagent for a phase, pass:

1. The original task description
2. Any prior phase outputs (problem statement, design doc, etc.)
3. The specific deliverable expected from this phase

Example delegation message:

```text
Phase: technical-design
Owner: principal-architect
Input: [problem statement from discovery]
Expected output: design doc covering data model, API contract, trade-offs, and ADR
```

<example>
user: "We need to add multi-currency support to checkout. Assemble the team."
assistant: This is a greenfield feature touching payments, so I'll route through the full pipeline with security review embedded.

Routing plan:

1. discovery (product-manager) — clarify which currencies, regulatory constraints, success criteria
2. technical-design (principal-architect + security-engineer) — currency conversion model, data storage, PCI scope; run in parallel with security threat model
3. implementation-workflow (tech-lead + rails-engineer + go-engineer) — backend currency service (Go), Rails checkout integration; two parallel workstreams
4. code-review-process (code-reviewer + security-engineer) — security-engineer required due to payment scope
5. shipping (sre + tech-lead) — feature-flag rollout, rollback plan, alerting on conversion failures

Launching discovery subagent now with the task context.
</example>
