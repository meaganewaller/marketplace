---
description: Produce a severity-tagged code review report for a path, diff, or scope
argument-hint: <path, diff, or scope to review>
---

# Review

Run a thorough code review and produce a report with findings tagged by severity.

## Usage

```text
/dev-collective:review app/controllers/payments_controller.rb
/dev-collective:review the current git diff
/dev-collective:review all changes in the auth module
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to identify the target: a file path, a directory, a description of the current diff, or a named scope. If the argument refers to "the current diff" or similar, work from the staged and unstaged changes in the working tree.

2. Launch the `dev-collective:code-reviewer` agent and apply the `code-review-process` skill to analyze the target.

3. Assess whether the change touches sensitive areas: authentication, authorization, session handling, cryptography, secrets management, payment flows, personally identifiable information, infrastructure configuration, or dependency updates. If any sensitive area is involved, also launch `dev-collective:security-engineer` in parallel. Merge the security findings into the final report under a dedicated section.

4. The review report must include:

   - **Summary**: two to four sentences describing what the change does and the overall quality signal
   - **Findings**: a list of findings, each with:
     - Severity tag: `CRITICAL` (must fix before merge), `MAJOR` (strong recommendation to fix), `MINOR` (suggestion), or `NIT` (style or preference)
     - File and line reference where applicable
     - Clear description of the issue
     - A concrete recommendation or code suggestion
   - **Security findings** (if applicable): findings from `dev-collective:security-engineer`, tagged with the same severity scale and prefixed with `[SECURITY]`
   - **Positives**: at least one note on what the change does well — do not omit this section
   - **Verdict**: one of `APPROVE`, `APPROVE WITH SUGGESTIONS`, or `REQUEST CHANGES`, with a one-line justification

5. Findings must be specific and actionable. Vague comments such as "this could be better" are not acceptable.

6. Return the complete review report as the command output.
