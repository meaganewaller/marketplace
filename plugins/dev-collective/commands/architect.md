---
description: Produce a design doc or RFC with trade-offs and a clear recommendation
argument-hint: <system or feature to design>
---

# Architect

Design a system or feature end to end, surfacing trade-offs and committing to a recommended approach.

## Usage

```text
/dev-collective:architect Event-driven notification pipeline supporting email, SMS, and push
/dev-collective:architect Multi-region active-active data replication strategy for the orders database
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to identify the system or feature being designed, its boundaries, and any stated requirements or constraints.

2. Launch the `dev-collective:principal-architect` agent and apply the `technical-design` skill to produce a full design document.

3. If the task surface area contains deep unknowns — novel infrastructure patterns, unfamiliar third-party integrations, or high-consequence irreversible decisions — also launch `dev-collective:staff-engineer` in parallel to provide a second perspective. Reconcile any material differences between the two agents before producing the final output.

4. The design document must include:

   - **Context and goals**: what problem is being solved and why it matters now
   - **Scope**: what is explicitly in and out of scope
   - **Constraints**: performance targets, cost ceilings, compliance requirements, existing technology boundaries
   - **Options considered**: at least two alternative approaches, each with a clear description, key trade-offs, and a verdict (recommended / viable / not recommended)
   - **Recommended design**: the chosen approach described in enough detail to serve as a blueprint for implementation, including data models, API contracts, component interactions, and sequencing where relevant
   - **Open questions**: unresolved decisions the implementer must make, with guidance on how to resolve them
   - **Risks and mitigations**: the top risks of the recommended approach and how to address each

5. The recommendation must be opinionated. Do not produce a document that merely lists options without committing to one.

6. Return the complete design document as the command output, formatted as a structured RFC ready for team review.
