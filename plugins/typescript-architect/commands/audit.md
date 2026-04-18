---
description: Run a code quality audit on TypeScript files
argument-hint: <path-or-module>
---

# Audit Command

Perform a systematic code quality audit on the specified path or module.

## Usage

```text
/typescript-architect:audit src/services
/typescript-architect:audit src/components/UserForm.tsx
/typescript-architect:audit .
```

## Instructions

When invoked:

1. **Determine scope**: Use $ARGUMENTS as the target path. If empty, audit the current working directory.

2. **Activate the code-quality-audit skill** to guide the analysis process.

3. **Use the architecture-reviewer agent** to perform the read-only analysis if the scope is large (> 5 files). For smaller scopes, perform the analysis directly.

4. **Generate a structured report** following the format defined in the code-quality-audit skill.

5. **Prioritize findings**: List critical issues first, then warnings, then observations.

6. **Be actionable**: Every finding should include a specific, concrete recommendation -- not just "refactor this."

## Output Format

The audit should produce a markdown report with:

- Overall grade (A-F)
- Summary statistics
- Prioritized findings with file:line references
- Concrete recommendations
- Metrics table
