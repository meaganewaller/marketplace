---
name: shipping
description: Release readiness owned by sre with tech-lead support. Covers pre-ship checklist, rollout strategy (canary, blue-green, feature flags), observability and rollback plan, release notes, and post-deploy verification. Use when someone says "ship it", "release readiness", "ready to deploy", "go-live checklist", "rollout plan", "can we deploy", "cut a release", "pre-deploy checklist", or "what do we need before we go live".
---

# Shipping

Shipping is the final lifecycle phase. The sre owns release readiness and rollout strategy; the tech-lead is accountable for feature completeness and rollback coordination. A release that cannot be rolled back is not ready to ship.

## When to Use This Skill

- Code is merged and a deploy is being planned
- A rollout strategy needs to be chosen
- Pre-deploy verification needs to be run
- Release notes need to be written
- A post-deploy monitoring plan needs to be in place

## Pre-Ship Checklist

Run this checklist before any deploy to a production-adjacent environment.

### Code & Review

```text
[ ] All PRs merged to the target branch; no open review threads
[ ] CI is green on the target branch (tests, linter, type checks, security scans)
[ ] No known blocking bugs or regressions in the milestone
[ ] Feature flags are in place for changes not intended to be immediately live
```

### Database & Migrations

```text
[ ] Migrations are reversible (down migration present or no-op reversal documented)
[ ] Additive-only migrations (new columns/tables) verified before deploy
[ ] Destructive migrations (drop column, rename) scheduled for a separate deploy
    after the application no longer references the old schema
[ ] Long-running migrations timed and tested against a production-sized dataset
```

### Observability

```text
[ ] New code paths emit logs at appropriate levels (info for normal flow, error for failures)
[ ] New background jobs have queue-depth and failure-rate metrics
[ ] Dashboards updated or new dashboard created for the feature
[ ] Alerts defined for error rate spikes, latency regressions, and queue backlog
[ ] Runbook written or updated for any new alert
```

### Rollback Plan

```text
[ ] Rollback command documented and tested in staging
[ ] If a migration cannot be rolled back, a forward-fix procedure is documented
[ ] Feature flag kill switch confirmed to work (turn off → feature disappears)
[ ] On-call engineer briefed on the change and the rollback procedure
```

## Rollout Strategies

Choose the strategy based on risk and blast radius.

```text
Strategy          When to use                              How
──────────────────────────────────────────────────────────────────────────────
Feature flag      Any user-visible change; high-risk       Deploy dark; enable
                  backend changes                          flag by segment
Canary            Stateless services; confident but        Route 1-5% of traffic;
                  cautious                                 watch metrics; expand
Blue-green        Full app replacement; zero-downtime      Bring up new stack;
                  cutover needed                           flip load balancer;
                                                           keep old stack warm
Rolling deploy    Containerized / multi-instance apps      Replace instances one
                  with no migration risk                   at a time
Immediate full    Hotfix; zero blast radius; reversal      Deploy directly;
deploy            is trivial                               monitor closely
```

## Rollout Decision Tree

```text
Is the change user-visible?
  Yes → Use feature flag; enable by segment after deploy
  No  → Is there a migration?
          Yes → Is it destructive?
                  Yes → Two-phase deploy (code first, migration in follow-up)
                  No  → Rolling deploy with migration before code
          No  → Rolling deploy or canary based on service criticality
```

## Release Notes Template

```text
## [Version or Date] — [Feature Name]

### What changed
[One to three sentences describing the user-visible change.]

### Who is affected
[User segment or internal team.]

### How to enable (if feature-flagged)
[Flag name and where to set it.]

### Known limitations
[Anything from the MoSCoW "won't" list that users might ask about.]

### Rollback
[One-liner: how to revert if something goes wrong.]
```

## Post-Deploy Verification

Run these checks in the first 30 minutes after a production deploy.

```text
Time      Check
────────────────────────────────────────────────────────────────────────
+0 min    Confirm deploy completed; no error spike in logs
+5 min    Smoke test the happy path end-to-end in production
+10 min   Verify error rate is within normal bounds (compare to prior window)
+15 min   Check p99 latency on affected endpoints
+20 min   Verify background jobs are draining (no unexpected queue growth)
+30 min   If feature-flagged: enable for 5% of users; watch metrics for 15 min
          before broader rollout
```

If any check fails, execute the rollback plan immediately. Do not wait to see if it recovers.

## Process

1. Confirm all PRs for the milestone are merged and CI is green.
2. Run the pre-ship checklist; resolve every unchecked item before proceeding.
3. Choose a rollout strategy using the decision tree.
4. Write the release notes.
5. Brief the on-call engineer; confirm rollback procedure is understood.
6. Execute the deploy.
7. Run post-deploy verification checks on the timed schedule above.
8. If feature-flagged: progressively expand the flag audience, pausing at each increment to check metrics.
9. Declare the release complete when the feature is at 100% traffic and metrics are stable.

## Outputs

- **Completed pre-ship checklist** — every item checked or a documented exception
- **Rollout plan** — chosen strategy, flag names, canary percentages, timeline
- **Release notes** — filled from the template above
- **Post-deploy runbook** — the timed verification schedule plus rollback command
- **Release complete declaration** — explicit sign-off once metrics are stable at full traffic

<example>
user: "We're ready to ship the CSV export feature. What's the go-live checklist?"
assistant: Running the shipping checklist for the CSV export feature.

Rollout strategy: Feature flag (`csv_export`), enable by user segment — start with internal users, then 10% of finance accounts, then full rollout.

Pre-ship checklist (abbreviated):

- CI green on main ✓
- Migration (add exports table) is additive-only, reversible ✓
- ExportJob queue-depth metric added to Sidekiq dashboard ✓
- Alert on export failure rate > 5% over 5 minutes ✓
- Rollback: disable `csv_export` flag; no migration rollback needed since table is additive ✓

Release notes:

```text
## 2026-06-09 — CSV Export for Reports

What changed: Finance users can now export any report view to CSV directly from the reports page.
Who is affected: Finance team; initially internal users only.
How to enable: Set feature flag `csv_export` to true for the target user segment.
Known limitations: XLSX and PDF export are deferred. Scheduled recurring exports are not included.
Rollback: Disable the `csv_export` feature flag. No data loss risk.
```

Post-deploy: Smoke test export with an internal account at +5 min; check Sidekiq queue and error rate at +15 min; expand to 10% of finance accounts at +30 min if clean.
</example>
