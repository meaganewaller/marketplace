# Code Quality Metrics and Thresholds

## Complexity Metrics

### Cyclomatic Complexity

Counts the number of independent paths through code.

| Score | Rating | Action |
|-------|--------|--------|
| 1-5 | Low | No action needed |
| 6-10 | Moderate | Consider simplification |
| 11-20 | High | Should be refactored |
| 21+ | Very High | Must be refactored |

**How to count:** Start at 1, add 1 for each `if`, `else if`, `case`, `&&`, `||`, `??`, `?.`, ternary `?`, `catch`, loop (`for`, `while`, `do`).

### Cognitive Complexity

Measures how hard code is to understand (accounts for nesting).

```typescript
// Cognitive complexity: 7
function processUser(user: User) {           // +0
  if (user.isActive) {                       // +1 (if)
    for (const order of user.orders) {       // +2 (loop, nested)
      if (order.status === 'pending') {      // +3 (if, double-nested)
        sendReminder(user, order);           // +0
      } else {                              // +1 (else)
        // ...
      }
    }
  }
}

// Refactored: Cognitive complexity: 3
function processUser(user: User) {
  if (!user.isActive) return;                // +1 (if)
  user.orders
    .filter(o => o.status === 'pending')     // +1 (condition)
    .forEach(o => sendReminder(user, o));    // +1 (iteration)
}
```

## Size Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Lines per function | < 20 | 20-50 | > 50 |
| Lines per file | < 200 | 200-400 | > 400 |
| Parameters per function | ≤ 3 | 4-5 | > 5 |
| Exports per module | ≤ 5 | 6-10 | > 10 |
| Nesting depth | ≤ 2 | 3 | > 3 |

## Coupling Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Afferent coupling (who depends on me) | — | > 10 | > 20 (high blast radius) |
| Efferent coupling (what I depend on) | ≤ 5 | 6-8 | > 8 (fragile) |
| Circular dependencies | 0 | — | Any |
| Layer violations | 0 | — | Any |

### Dependency Direction Rules

```text
✓ Handler → Service → Repository → Database
✗ Repository → Service (reverse dependency)
✗ Handler → Database (skipping layers)
✗ Service → Handler (upward dependency)
```

## Type Safety Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| `any` occurrences | 0 | 1-3 (with justification comment) | > 3 |
| Type assertions (`as`) | 0 | 1-5 (at boundaries) | > 5 |
| Non-null assertions (`!`) | 0 | 1-2 | > 2 |
| `@ts-ignore` / `@ts-expect-error` | 0 | 1 (with explanation) | > 1 |

## Maintainability Index

Composite score combining complexity, size, and coupling:

```text
Grade = weighted average of:
  - Complexity Score (40%)
  - Type Safety Score (25%)
  - Coupling Score (20%)
  - Naming/Clarity Score (15%)

A = 90-100 (excellent — maintainable, clear, well-typed)
B = 80-89  (good — minor issues)
C = 70-79  (fair — notable issues to address)
D = 60-69  (poor — significant refactoring needed)
F = < 60   (failing — critical issues, high maintenance risk)
```
