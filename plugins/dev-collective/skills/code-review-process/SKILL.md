---
name: code-review-process
description: Review gate owned by code-reviewer; security-engineer leads for sensitive changes (auth, payments, secrets, permissions). Covers what to check, a severity taxonomy (blocking / should-fix / nit), a review checklist, how to give actionable feedback, and when to request changes vs. approve. Use when someone says "review this", "code review", "is this ready to merge", "check this PR", "look at my diff", "LGTM?", or "give me feedback on this code".
---

# Code Review Process

Code review is the quality gate between implementation and shipping. The code-reviewer owns the general review; the security-engineer leads whenever the change touches authentication, authorization, payments, secrets, or PII. A good review catches real problems, teaches through feedback, and moves quickly — it is not a style lecture or a power exercise.

## When to Use This Skill

- A PR is open and needs review before merge
- A change is sensitive (auth, payments, secrets) and needs security-engineer eyes
- The author wants a self-review checklist before requesting review
- The team needs to decide whether to approve or request changes

## Severity Taxonomy

Every review comment must carry a severity label so the author knows what to do.

```text
Severity      Meaning                                    PR action
──────────────────────────────────────────────────────────────────────────
blocking      Must be fixed before merge. Correctness    Request changes
              bug, security vulnerability, data loss
              risk, or broken contract.

should-fix    Strong recommendation. Not a showstopper   Request changes or
              but will cause pain if merged as-is.       approve with comment
              Performance problem, missing test for
              a critical path, misleading naming.

nit           Optional polish. Style, minor naming,      Approve; author
              comment wording. Never block a merge       decides whether
              on a nit.                                  to address
```

If a review has only nits, approve. Do not hold a PR hostage to nits.

## Review Checklist

Work through this checklist in order. Stop and comment immediately when a blocking issue is found — do not continue silently.

### Correctness

```text
[ ] Does the code do what the PR description says it does?
[ ] Are edge cases handled (empty input, null, concurrent access, large data)?
[ ] Are error paths explicit and tested?
[ ] Are there off-by-one errors, type mismatches, or incorrect comparisons?
[ ] Do tests actually assert behavior, not just execute without error?
```

### Security (escalate to security-engineer if any apply)

```text
[ ] Are secrets, tokens, and credentials handled via environment variables or a secrets manager — never hardcoded?
[ ] Is user input validated and sanitized before use in queries, file paths, or shell commands?
[ ] Are authorization checks present on every new endpoint or action?
[ ] Does the change expand the attack surface (new public endpoint, new third-party dependency)?
[ ] Are cryptographic operations using standard library primitives (no hand-rolled crypto)?
```

### Design & Maintainability

```text
[ ] Does the change fit the existing architecture patterns in the codebase?
[ ] Is complexity justified? Could simpler code achieve the same result?
[ ] Are public interfaces (APIs, module boundaries) clear and minimal?
[ ] Is business logic separated from I/O (database, HTTP, file system)?
```

### Tests

```text
[ ] Is new behavior covered by tests at the appropriate level (unit / integration / e2e)?
[ ] Are tests readable — does each test name describe what it checks?
[ ] Are there tests for the failure path, not only the happy path?
[ ] Does coverage drop on any critical module?
```

### Operational Readiness

```text
[ ] Are new errors logged with enough context to debug in production?
[ ] Are new background jobs and scheduled tasks observable (metrics, alerts)?
[ ] Is the migration reversible, or is a down-migration present?
[ ] Does the change respect rate limits and resource budgets?
```

## How to Give Actionable Feedback

Structure every comment as: **observation → impact → suggestion**.

```text
[blocking] The `find_by_token` call on line 42 returns nil when the token
is expired, but the caller dereferences the result without a nil check.
This will raise a NoMethodError in production when tokens expire.
Suggest: return early or use `find_by_token!` and rescue the exception
at the controller boundary.
```

Avoid:

- Vague comments ("this seems wrong", "not sure about this")
- Questions without a suggestion ("why did you do it this way?") — state your concern directly
- Lecturing on style in a blocking comment
- Approving with unresolved blocking comments

## When to Request Changes vs. Approve

```text
Situation                                   Action
───────────────────────────────────────────────────────────────────────
One or more blocking issues found           Request changes
Only should-fix issues (no blocking)        Request changes OR approve
                                            with explicit expectation
                                            that should-fix items are
                                            addressed before merge
Only nits                                   Approve
No issues found                             Approve with a brief note
Security concern that needs expert review   Block until security-engineer
                                            has reviewed
```

## Process

1. Read the PR description and linked design doc or issue before looking at the diff.
2. Check out the branch locally if behavior is non-obvious from reading.
3. Work through the review checklist in order.
4. Label every comment with a severity.
5. Group related comments when possible to reduce noise.
6. Leave an overall summary comment: what you found, what blocks merge, and any praise for good decisions.
7. Set the review state: approve, request changes, or comment-only.
8. Re-review promptly when the author addresses blocking issues — do not let PRs stall.

## Outputs

- **Inline comments** — each labeled with a severity, structured as observation → impact → suggestion
- **Summary comment** — overall assessment, list of blockers, and a clear approve/request-changes verdict
- **Security escalation note** — if security-engineer review is required, flag it explicitly in the summary

<example>
user: "Review this PR that adds the CSV export endpoint."
assistant: Reviewed. Here is the summary:

Overall: Request changes — one blocking issue, one should-fix, two nits.

[blocking] app/jobs/export_job.rb line 18: The S3 upload uses `EXPORT_BUCKET` read directly from ENV. If the variable is unset in a new environment, the job will silently write to a nil bucket name and raise a cryptic AWS error. Use `ENV.fetch('EXPORT_BUCKET')` so misconfiguration fails loudly at startup.

[should-fix] app/services/csv_exporter.rb line 44: No test covers the case where the user has permission to zero rows. The current test suite only exercises non-empty scopes. A zero-row export should produce a CSV with headers only — please add a test.

[nit] app/jobs/export_job.rb line 5: `generate_the_csv` could be named `generate_csv` to match the project's verb-object naming style.

[nit] app/mailers/export_mailer.rb line 12: Extra blank line before the subject assignment.

No security-engineer escalation needed — the export respects existing row-level scopes and no new auth surface is introduced.
</example>
