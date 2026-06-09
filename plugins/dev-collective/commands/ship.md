---
description: Assess release readiness — pre-ship checklist, rollout strategy, and rollback plan
argument-hint: <change or release to assess>
---

# Ship

Evaluate whether a change is ready to ship and produce a concrete plan for getting it to production safely.

## Usage

```text
/dev-collective:ship The new checkout flow replacing the legacy cart service
/dev-collective:ship Database migration adding a non-null column to the orders table
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to understand the change or release being assessed: what is changing, what systems are affected, and any stated timeline or constraints.

2. Launch the `dev-collective:sre` agent and the `dev-collective:tech-lead` agent in parallel, both applying the `shipping` skill. The SRE agent leads on observability, rollback, and incident posture; the tech-lead agent leads on pre-ship completeness and rollout sequencing. Synthesize both perspectives into a single report.

3. The release-readiness assessment must include:

   - **Change summary**: one paragraph describing what is shipping, its blast radius, and the primary risk vector
   - **Pre-ship checklist**: a concrete checklist of items that must be true before the release proceeds, organized into categories:
     - Code quality (tests passing, no known regressions, review approved)
     - Configuration and environment (feature flags, environment variables, secrets rotation if needed)
     - Data and migrations (migration safety, backward compatibility, data validation)
     - Dependencies (third-party service readiness, downstream consumer notification)
     - Documentation and runbooks (updated runbooks, on-call briefed)
   - **Rollout strategy**: the recommended deployment approach (full deploy, percentage rollout, feature flag gate, dark launch, blue-green, canary) with justification and specific staged milestones if a gradual rollout is recommended
   - **Observability plan**: the key metrics, logs, and alerts to monitor during and after the rollout, and the time window to watch before declaring the release stable
   - **Rollback plan**: exact steps to revert the change, time estimate to complete a rollback, and any conditions that should automatically trigger rollback consideration
   - **Go / No-go recommendation**: a clear `GO` or `NO-GO` with the single most important reason supporting the verdict

4. If the change involves a database migration, the assessment must explicitly address migration safety (zero-downtime patterns, lock risks, estimated duration) and whether a pre-migration data audit is required.

5. Do not approve a release with an incomplete pre-ship checklist. If blockers are present, list them prominently and mark the verdict `NO-GO`.

6. Return the complete release-readiness assessment as the command output.
