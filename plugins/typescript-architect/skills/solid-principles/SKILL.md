---
name: solid-principles
description: Analyze and apply SOLID principles to TypeScript code. Use when reviewing code for SRP, OCP, LSP, ISP, or DIP violations, refactoring toward SOLID compliance, or designing new modules/classes.
---

# SOLID Principles for TypeScript

Specialized guidance for applying SOLID principles in TypeScript/Bun projects.

## When to Use This Skill

Use this skill when:

- Reviewing code for SOLID violations
- Refactoring classes or modules toward SOLID compliance
- Designing new abstractions (interfaces, classes, modules)
- Deciding whether to split or merge responsibilities
- Evaluating inheritance hierarchies

## Core Decision Framework

Before applying any principle, ask:

1. **What changes together?** → SRP boundary
2. **What should be extensible without modification?** → OCP candidate
3. **Can subtypes substitute without surprises?** → LSP check
4. **Are consumers forced to depend on unused methods?** → ISP violation
5. **Does high-level policy depend on low-level detail?** → DIP violation

## Quick Reference

| Principle | Violation Signal | TypeScript Fix |
|-----------|-----------------|----------------|
| SRP | Class has multiple reasons to change | Extract into focused modules with single exports |
| OCP | Switch statements on type discriminators growing | Use polymorphism, strategy pattern, or discriminated unions |
| LSP | Subtypes throwing `NotImplementedError` or overriding with no-ops | Redesign hierarchy; prefer composition over inheritance |
| ISP | Consumers importing interfaces with unused methods | Split interfaces by consumer need |
| DIP | Direct `new` of concrete classes in business logic | Inject dependencies via constructor or factory functions |

## Progressive Disclosure

For detailed guidance on each principle with TypeScript-specific examples:

- **Single Responsibility** → Read `references/srp.md`
- **Open-Closed** → Read `references/ocp.md`
- **Liskov Substitution** → Read `references/lsp.md`
- **Interface Segregation** → Read `references/isp.md`
- **Dependency Inversion** → Read `references/dip.md`

## Analysis Process

When analyzing code for SOLID compliance:

1. **Identify the unit**: Is it a class, module, or function?
2. **Map responsibilities**: List what the unit does (each verb is a candidate responsibility)
3. **Check each principle** against the quick reference table above
4. **Prioritize violations**: Not all violations need fixing — prioritize by change frequency and blast radius
5. **Propose minimal refactoring**: Smallest change that resolves the violation

## Common TypeScript Anti-Patterns

### God Module

```typescript
// BAD: One module doing everything
export class UserService {
  async createUser() { /* ... */ }
  async sendEmail() { /* ... */ }
  async generateReport() { /* ... */ }
  async validatePayment() { /* ... */ }
}
```

### Leaky Abstraction

```typescript
// BAD: Interface exposes implementation details
interface Repository<T> {
  findAll(): Promise<T[]>;
  executeSql(query: string): Promise<unknown>; // Leaks SQL
}
```

### Fat Interface

```typescript
// BAD: Consumers forced to implement unused methods
interface Animal {
  fly(): void;
  swim(): void;
  walk(): void;
  breatheUnderwater(): void;
}
```

## When NOT to Apply SOLID

- **Throwaway scripts**: SOLID adds ceremony that hurts velocity
- **Simple data containers**: Plain types/interfaces don't need SRP analysis
- **Performance-critical hot paths**: Sometimes inlining beats abstraction
- **Premature abstraction**: Wait until you have 3+ concrete cases before extracting

<example>
user: Review this class for SOLID violations
assistant: I'll analyze this using the SOLID principles skill.

[Reads the code]
[Maps responsibilities - identifies 4 distinct responsibilities]
[Checks each principle]

**Findings:**

1. **SRP Violation**: This class handles both user validation and persistence. These change for different reasons.
2. **DIP Violation**: Direct instantiation of `PostgresConnection` in business logic.

**Recommended refactoring:**

- Extract validation into a `UserValidator` module
- Inject the database connection via constructor parameter typed to an interface

[Shows before/after code]
</example>
