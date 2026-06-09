---
name: implementation-workflow
description: Build phase owned by tech-lead and executed by language experts (rails-engineer, python-engineer, rust-engineer, go-engineer, bash-engineer). Covers work breakdown, sequencing, picking the right language expert, taking small reversible steps, keeping tests green, and definition of done. Use when someone says "break this down", "implement", "plan the build", "start coding", "work breakdown", "how do we build this", "create a task list", or "implementation plan".
---

# Implementation Workflow

Implementation workflow is the build phase. The tech-lead owns planning and coordination; language experts own execution. This skill emphasizes small, reversible steps, continuous test coverage, and a clear definition of done so review and shipping can proceed without surprises.

## When to Use This Skill

- A design doc exists and it is time to write code
- A task needs to be broken into trackable units of work
- The right language expert needs to be selected for each workstream
- A definition of done needs to be established before work starts

## Selecting the Right Language Expert

```text
Signal                                    Route to
──────────────────────────────────────────────────────────────────
Rails / Ruby / ActiveRecord / Sidekiq     rails-engineer
Python / Django / FastAPI / data scripts  python-engineer
Rust / systems / WASM / performance       rust-engineer
Go / gRPC / microservices / CLI tooling   go-engineer
Shell / CI scripts / automation / glue    bash-engineer
Full-stack (frontend + backend)           tech-lead coordinates
                                          multiple experts
```

If a task spans multiple languages, the tech-lead breaks it into per-language workstreams and assigns each to the appropriate expert.

## Work Breakdown Structure

Decompose the design into tasks at two levels:

```text
Milestone  — a shippable increment (passes tests, mergeable)
  └─ Task  — a unit completable in one sitting (<= 4 hours)
       └─ Subtask (optional) — a discrete code change or file touched
```

Rules for good tasks:

```text
- One clear deliverable per task
- Independently mergeable (feature flags if needed)
- Includes test coverage as part of done — not a follow-up task
- Reversible: if wrong, rollback is straightforward
- No task depends on an unmerged sibling unless explicitly sequenced
```

## Sequencing Principles

1. **Foundation first** — data migrations and schema changes before application logic.
2. **Contracts before consumers** — define API shapes or interfaces before writing callers.
3. **Happy path before edge cases** — get green-field passing tests before hardening.
4. **Parallel when safe** — independent workstreams (e.g., backend API and frontend component) can run concurrently.
5. **Integrate early** — avoid long-lived branches; merge to main (behind a feature flag if needed) frequently.

## Keeping Tests Green

```text
Rule                              Why
──────────────────────────────────────────────────────────────────────────
Write the test before the code    Forces clear acceptance criteria per task
No PR without passing tests       Prevents accumulation of broken states
Run the full suite locally        Catches cross-module regressions early
Test at the right level           Unit for logic; integration for I/O;
                                  system/e2e for user-facing flows
Do not disable failing tests      Fix or skip with a tracked issue — never delete
```

## Definition of Done

A task is done when **all** of the following are true:

```text
[ ] Code matches the design doc's API contract and data model
[ ] All new logic has unit tests; affected integration paths have integration tests
[ ] CI passes (tests, linter, type checks)
[ ] No new security findings introduced (secrets, SQL injection, XSS, etc.)
[ ] Feature flag in place if the change is user-visible and not yet ready to ship
[ ] Self-review checklist passed (see code-review-process skill)
[ ] PR description explains what changed and why, with a link to the design doc
```

## Process

1. Confirm the design doc and acceptance criteria are finalized.
2. Identify workstreams (backend, frontend, infrastructure, migrations, etc.).
3. For each workstream, select the appropriate language expert.
4. Decompose each workstream into milestones, then tasks.
5. Sequence tasks using the sequencing principles above.
6. Flag any tasks that can run in parallel and note dependencies.
7. For each task: write the test first, implement, confirm tests pass, self-review, open PR.
8. At milestone completion, verify the milestone against acceptance criteria before proceeding.
9. Hand off completed milestones to code-review-process.

## Outputs

- **Work breakdown** — milestones and tasks, each with owner (role), estimated effort, and dependencies
- **Sequencing diagram** — ordered list or dependency graph showing what blocks what
- **Per-task definition of done** — checklist confirming test coverage and CI requirements
- **Feature flag plan** — which changes are gated, and the flag name/location

<example>
user: "Break down the CSV export feature for implementation."
assistant: Tech-lead perspective — here is the work breakdown:

Workstreams: backend (rails-engineer), infrastructure/storage (sre consult), email delivery (rails-engineer, same workstream).

Milestone 1 — Schema & job scaffolding (rails-engineer)

- Task 1.1: Add ExportJob Sidekiq worker skeleton with test
- Task 1.2: Add exports table migration (status, user_id, s3_key, created_at)
- Task 1.3: Add Export model with validations and scopes

Milestone 2 — CSV generation (rails-engineer)

- Task 2.1: CsvExporter service object — builds CSV from Report scope
- Task 2.2: Row-level permission filtering in exporter (unit tested against fixtures)
- Task 2.3: Upload to S3, store key on Export record

Milestone 3 — Delivery & UI (rails-engineer)

- Task 3.1: Mailer for download-link email with presigned URL
- Task 3.2: Controller action to enqueue job; JSON response with export ID
- Task 3.3: "Export CSV" button on reports page behind feature flag `csv_export`

Sequencing: 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 3.1 (parallel with 3.2) → 3.3

Definition of done per task: unit tests, CI green, no hardcoded secrets, PR linked to design doc.
</example>
