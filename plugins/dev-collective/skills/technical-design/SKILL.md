---
name: technical-design
description: System and technical design owned by principal-architect with staff-engineer support. Produces a design doc or RFC covering architecture, trade-off analysis, non-functional requirements, alternatives considered, and architecture decision records (ADRs). Use when someone says "design this", "write a design doc", "RFC", "architecture for", "evaluate approaches", "how should we build this", "technical design", or "write an ADR".
---

# Technical Design

Technical design translates the problem statement and acceptance criteria from discovery into a concrete blueprint that implementation can follow. The principal-architect owns this phase; the staff-engineer contributes trade-off analysis and non-functional requirements. The output is a design doc or RFC.

## When to Use This Skill

- Requirements are clear and it is time to decide how to build
- Multiple architectural approaches exist and trade-offs need explicit documentation
- A new system, service, or significant subsystem is being introduced
- A decision has long-term consequences and needs an ADR

## Design Doc Template

```markdown
# [Feature / System Name] — Design Doc

**Status:** Draft | In Review | Accepted | Superseded
**Authors:** [roles / names]
**Date:** YYYY-MM-DD
**Replaces / Related:** [links to prior ADRs or designs]

---

## Problem Statement
[One paragraph. Paste from discovery output.]

## Goals
- [Measurable goal 1]
- [Measurable goal 2]

## Non-Goals
- [Explicitly out of scope]

## Background & Context
[Relevant system state, prior art, constraints from discovery.]

## High-Level Design
[Architecture diagram (ASCII or Mermaid), data flow, component responsibilities.]

## Detailed Design

### Data Model
[Schema changes, new tables/collections, migration plan.]

### API Contract
[Endpoints, request/response shapes, error codes.]

### Key Algorithms / Logic
[Any non-trivial business logic. Pseudocode is fine.]

### Non-Functional Requirements
| Concern        | Requirement                      | How met |
|----------------|----------------------------------|---------|
| Latency        | p99 < 200 ms                     |         |
| Throughput     | 1,000 req/s sustained            |         |
| Availability   | 99.9% monthly                    |         |
| Data retention | 90 days, GDPR-compliant deletion |         |
| Security       | Auth model, secrets handling     |         |

## Alternatives Considered
### Option A — [Name]
**Pros:** ...
**Cons:** ...

### Option B — [Name]
**Pros:** ...
**Cons:** ...

### Decision
[Chosen option and the decisive reason.]

## Implementation Plan
[High-level phases; link to implementation-workflow for details.]

## Open Questions
- [ ] [Question and owner]

## Architecture Decision Records
[Inline ADR(s) or links.]
```

## Trade-off Analysis Framework

For each alternative, evaluate on these axes:

```text
Axis                  Questions to answer
────────────────────────────────────────────────────────────────────
Complexity            How hard to build, operate, and debug?
Reversibility         Can we migrate away if this is wrong?
Performance           Does it meet non-functional requirements?
Operability           How do we monitor, alert, and roll back?
Security              Does it expand the attack surface?
Cost                  Infrastructure, licensing, engineering time?
Consistency           Does it align with existing patterns in the codebase?
```

## Architecture Decision Records (ADRs)

An ADR captures a single consequential decision. Write one when the choice has long-term impact and the rationale would otherwise be lost.

```text
ADR-NNNN: [Short title]
Status:   Proposed | Accepted | Deprecated | Superseded by ADR-MMMM
Context:  [Forces at play; why a decision was needed]
Decision: [What was decided, stated plainly]
Rationale:[Why this option over the alternatives]
Consequences: [What becomes easier, harder, or different]
```

## Process

1. Confirm the problem statement and acceptance criteria from discovery.
2. Identify non-functional requirements (latency, throughput, availability, security, compliance).
3. Enumerate at least two alternative approaches.
4. Evaluate each alternative on the trade-off axes.
5. Select the approach with the best fit given constraints.
6. Fill in the design doc template.
7. Write ADR(s) for consequential decisions.
8. Mark open questions with owners and a resolution deadline.
9. Share the draft with code-reviewer and security-engineer for early feedback before implementation begins.

## Outputs

- **Design doc** filled from the template above
- **ADR(s)** for each consequential decision
- **Non-functional requirements table**
- **Alternatives considered** with decisive rationale
- **Open questions** list with owners

<example>
user: "Write a design doc for the CSV export feature."
assistant: I'll produce a design doc using the template. Key decisions to resolve:

1. Synchronous vs. asynchronous export — given the >10,000-row case from discovery, we need a background job. I'll evaluate Sidekiq (already in stack) vs. a dedicated export service.

2. File storage — temporary S3 presigned URL vs. serving directly from the job worker.

Trade-off: Sidekiq + S3 presigned URLs wins on consistency with existing infrastructure, reversibility, and zero new dependencies.

ADR-0042: Use Sidekiq for CSV export jobs

- Context: Export jobs can exceed 30 seconds for large datasets; synchronous response is not viable.
- Decision: Enqueue an ExportJob via Sidekiq; store the result in S3; email a presigned URL.
- Rationale: Sidekiq is already operated; S3 is already used for attachments; no new infrastructure.
- Consequences: Users must wait for email on large exports; adds Sidekiq job monitoring requirement.

[Full design doc follows template structure above.]
</example>
