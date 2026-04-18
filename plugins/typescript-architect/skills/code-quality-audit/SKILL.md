---
name: code-quality-audit
description: Audit TypeScript code for quality, complexity, coupling, and clean code violations. Use when reviewing code quality, checking for anti-patterns, assessing maintainability, or before major refactoring.
---

# Code Quality Audit for TypeScript

Systematic auditing of TypeScript code for maintainability, clarity, and adherence to clean code standards.

## When to Use This Skill

Use this skill when:

- Reviewing code for quality before merging
- Assessing whether code is ready for production
- Identifying maintenance risks in a module
- Evaluating technical debt
- Pre-refactoring assessment

## Audit Dimensions

| Dimension | What to Check | Severity |
|-----------|--------------|----------|
| **Complexity** | Cyclomatic complexity, nesting depth, function length | High |
| **Coupling** | Import fan-in/fan-out, dependency direction | High |
| **Naming** | Clarity, consistency, domain alignment | Medium |
| **Duplication** | Copy-paste code, similar patterns not abstracted | Medium |
| **Type Safety** | `any` usage, type assertions, missing null checks | High |
| **Error Handling** | Swallowed errors, missing error boundaries | High |
| **Testability** | Hard-coded dependencies, global state, side effects in constructors | Medium |
| **Cohesion** | Module doing multiple unrelated things | Medium |

## Audit Process

### Step 1: Scan Structure

```text
- Count files, lines, exports per module
- Map import graph (who depends on whom?)
- Identify the largest files (likely complexity hotspots)
```

### Step 2: Check Each Dimension

Use the scoring rubric below to grade each dimension.

### Step 3: Generate Report

Produce a structured report with findings, severity, and actionable recommendations.

## Scoring Rubric

### Complexity Score

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Function length | < 20 lines | 20-50 lines | > 50 lines |
| Nesting depth | ≤ 2 levels | 3 levels | > 3 levels |
| Parameters | ≤ 3 | 4-5 | > 5 |
| Cyclomatic complexity | ≤ 5 | 6-10 | > 10 |
| File length | < 200 lines | 200-400 lines | > 400 lines |

### Coupling Score

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Import count | ≤ 5 | 6-10 | > 10 |
| Circular dependencies | 0 | — | Any |
| Layer violations | 0 | — | Any |
| Fan-out (dependencies) | ≤ 5 | 6-8 | > 8 |

### Type Safety Score

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| `any` count | 0 | 1-3 (justified) | > 3 or unjustified |
| Type assertions (`as`) | 0-1 | 2-5 | > 5 |
| Non-null assertions (`!`) | 0 | 1-2 | > 2 |
| Missing return types (public API) | 0 | — | Any |

## Quick Commands for Auditing

```bash
# Count lines per file (find large files)
wc -l src/**/*.ts | sort -rn | head -20

# Find `any` usage
grep -rn ': any\b' src/ --include='*.ts'

# Find type assertions
grep -rn ' as ' src/ --include='*.ts' | grep -v 'import'

# Find non-null assertions
grep -rn '\!\\.' src/ --include='*.ts'

# Find deeply nested code (4+ levels of indentation)
grep -rn '^\t\{4,\}' src/ --include='*.ts'
```

## Progressive Disclosure

For detailed audit checklists:

- **Clean code checklist** → Read `references/clean-code-checklist.md`
- **Anti-patterns catalog** → Read `references/anti-patterns.md`
- **Metrics and thresholds** → Read `references/metrics.md`

## Report Format

```markdown
# Code Quality Audit: [Module Name]

## Summary
- **Overall Grade**: A/B/C/D/F
- **Files Analyzed**: N
- **Critical Issues**: N
- **Warnings**: N

## Findings

### Critical
1. [Finding with file:line reference]
   - **Impact**: [What could go wrong]
   - **Fix**: [Specific recommendation]

### Warnings
1. [Finding]
   - **Impact**: [Why it matters]
   - **Fix**: [Suggestion]

### Observations
- [Non-blocking notes for future improvement]

## Metrics
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Avg function length | N lines | < 20 | ✓/✗ |
| Max nesting depth | N | ≤ 2 | ✓/✗ |
| `any` count | N | 0 | ✓/✗ |
| Circular deps | N | 0 | ✓/✗ |
```

<example>
user: Audit this module for code quality
assistant: I'll use the code-quality-audit skill to systematically review this module.

[Scans files and structure]
[Checks each dimension against rubric]

## Code Quality Audit: UserModule

### Summary

- **Overall Grade**: B
- **Files Analyzed**: 6
- **Critical Issues**: 1
- **Warnings**: 3

### Critical

1. `user-service.ts:45` — Function `processRegistration` is 87 lines with 4 levels of nesting
   - **Impact**: Hard to test, understand, and modify safely
   - **Fix**: Extract validation, email sending, and audit logging into separate functions

### Warnings

1. `user-repository.ts:12` — 3 uses of `as any` for database results
   - **Fix**: Define proper return types for SQL queries
2. `user-controller.ts:8` — 12 imports from 9 different modules
   - **Fix**: High fan-out suggests this module has too many responsibilities
3. `types.ts:1-150` — All types in one file
   - **Fix**: Colocate types with their primary consumers
</example>
