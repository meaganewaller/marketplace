---
name: discovery
description: Problem framing and requirements gathering, owned by product-manager. Clarifies the problem, users, constraints, and success criteria; separates problem from solution; cuts scope to what matters. Produces a problem statement and acceptance criteria. Use when someone says "what are we actually building", "gather requirements", "define scope", "discovery", "frame the problem", "what problem are we solving", or "what do users need".
---

# Discovery

Discovery is the first lifecycle phase. Its job is to ensure the team builds the right thing before anyone writes a line of code. The product-manager owns this phase. The output is a crisp problem statement and a set of acceptance criteria that all subsequent phases can use as a contract.

## When to Use This Skill

- The task is vague, ambiguous, or solution-shaped before the problem is understood
- Requirements are missing, conflicting, or assumed
- Scope needs to be cut before design can begin
- A feature request arrives without user context or success criteria

## Core Framework

### 1. Problem vs. Solution Separation

Restate any solution-shaped request as a problem statement. "We need a dashboard" becomes "Users cannot currently see their account activity at a glance."

### 2. Five Discovery Questions

```text
1. Who has the problem?        (user segment, persona, job role)
2. What is the problem?        (observable pain, not the feature)
3. Why does it matter now?     (urgency, business impact, cost of delay)
4. How will we know we solved it? (measurable success criteria)
5. What is explicitly out of scope? (scope fence)
```

### 3. Constraint Inventory

Identify constraints before ideating solutions.

```text
Category        Examples
──────────────────────────────────────────────────────
Technical       Existing data model, API contracts, language/framework
Time            Hard deadlines, release windows
Regulatory      GDPR, PCI-DSS, HIPAA, accessibility (WCAG)
Resource        Team size, budget, third-party dependencies
Business        Pricing model, SLA commitments, brand guidelines
```

### 4. Scope Cutting

Apply the "must / should / could / won't" (MoSCoW) model to every proposed requirement. Push "could" and "won't" items to a parking lot — do not delete them.

## Process

1. Restate the task as a problem statement (one to three sentences, no solution language).
2. Identify the affected user segment(s).
3. Run through the Five Discovery Questions, asking the user to fill gaps.
4. Inventory constraints in each category.
5. List candidate requirements; apply MoSCoW prioritization.
6. Write acceptance criteria: each criterion is observable, testable, and written from the user's perspective.
7. Document the scope fence (what is explicitly not included).
8. Hand off the problem statement and acceptance criteria to technical-design.

## Acceptance Criteria Format

Each criterion follows this structure:

```text
Given <context>
When  <action>
Then  <observable outcome>
```

## Outputs

- **Problem statement** — one to three sentences, problem-focused, solution-free
- **User segment** — who is affected and why they care
- **Constraint inventory** — technical, time, regulatory, resource, business
- **MoSCoW-prioritized requirements** — must / should / could / won't
- **Acceptance criteria** — Given/When/Then format, one per observable outcome
- **Scope fence** — explicit list of what is out of scope

<example>
user: "We need a CSV export feature for the reports page."
assistant: Let me run discovery before we design anything.

Problem statement: Finance users cannot extract report data into their existing spreadsheet workflows, forcing manual copy-paste that introduces errors and costs ~30 minutes per report cycle.

User segment: Finance team members who produce weekly and monthly summaries in Google Sheets or Excel.

Constraints: Must work within the existing Rails background-job infrastructure; no new third-party billing; GDPR — exported data must respect existing row-level permissions.

MoSCoW:

- Must: Export current report view to CSV; respect row-level permissions
- Should: Allow column selection before export; email download link for large exports
- Could: Support XLSX format; scheduled recurring exports
- Won't (this iteration): PDF export, custom branding on the file

Acceptance criteria:

- Given a finance user is viewing any report, when they click "Export CSV", then a CSV file matching the current filtered view downloads within 5 seconds for datasets under 10,000 rows.
- Given a large dataset (>10,000 rows), when export is triggered, then the user receives an email with a download link within 10 minutes.
- Given a user without permission to see certain rows, when they export, then those rows are absent from the file.

Scope fence: PDF export, XLSX, scheduled exports, and custom file naming are deferred.
</example>
