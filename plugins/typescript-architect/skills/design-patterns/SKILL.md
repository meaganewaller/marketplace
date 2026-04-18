---
name: design-patterns
description: Select and implement design patterns in TypeScript. Use when choosing patterns for a problem, implementing GoF or modern patterns, or evaluating whether a pattern fits a use case.
---

# Design Patterns for TypeScript

Guidance for selecting and implementing design patterns in TypeScript/Bun projects.

## When to Use This Skill

Use this skill when:

- Choosing a design pattern to solve a structural or behavioral problem
- Implementing a known pattern in TypeScript
- Evaluating whether an existing pattern is the right fit
- Refactoring toward a well-known pattern

## Pattern Selection Guide

### "I need to..." Decision Tree

| Problem | Recommended Pattern | Reference |
|---------|-------------------|-----------|
| Create objects without specifying concrete classes | Factory / Builder | `references/creational.md` |
| Ensure only one instance exists | Module scope singleton | `references/creational.md` |
| Add behavior to objects dynamically | Decorator / Middleware | `references/structural.md` |
| Define a family of interchangeable algorithms | Strategy | `references/behavioral.md` |
| Notify multiple consumers of state changes | Observer / EventEmitter | `references/behavioral.md` |
| Process a request through a chain of handlers | Chain of Responsibility / Middleware | `references/behavioral.md` |
| Represent operations on a structure | Visitor (or discriminated unions) | `references/behavioral.md` |
| Manage complex object construction | Builder | `references/creational.md` |
| Decouple request sender from receiver | Command / Message Queue | `references/behavioral.md` |
| Provide a simplified interface to a complex subsystem | Facade | `references/structural.md` |

## TypeScript-First Principles

1. **Prefer functions over classes**: Many patterns simplify to functions + closures in TypeScript
2. **Use discriminated unions**: Often replaces Visitor, State, and Strategy class hierarchies
3. **Leverage structural typing**: No need for explicit `implements` in many cases
4. **Module scope = singleton**: ES modules are evaluated once — module-level state is a natural singleton
5. **Generics over inheritance**: Use generic constraints instead of abstract base classes

## Anti-Pattern: Pattern Overuse

```typescript
// OVER-ENGINEERED: AbstractSingletonProxyFactoryBean
class UserServiceFactory {
  createUserService(): UserService {
    return new UserService(new UserRepository(new Database()));
  }
}

// JUST RIGHT: Function
function createUserService(db: Database): UserService {
  return new UserService(new UserRepository(db));
}
```

## Progressive Disclosure

Load detailed pattern implementations from references:

- **Creational patterns** → Read `references/creational.md`
- **Structural patterns** → Read `references/structural.md`
- **Behavioral patterns** → Read `references/behavioral.md`

## When NOT to Use a Pattern

- You can't name the problem it solves in your codebase
- You have fewer than 3 concrete use cases
- A plain function achieves the same thing
- The pattern adds more indirection than clarity
- The codebase is a prototype or throwaway

<example>
user: I need to handle different payment methods (credit card, PayPal, crypto)
assistant: I'll use the design-patterns skill to recommend the right approach.

For interchangeable algorithms with a shared interface, the **Strategy pattern** is ideal — and in TypeScript, it simplifies to typed function parameters:

```typescript
type PaymentProcessor = (amount: number, details: PaymentDetails) => Promise<PaymentResult>;

const processCreditCard: PaymentProcessor = async (amount, details) => { /* ... */ };
const processPayPal: PaymentProcessor = async (amount, details) => { /* ... */ };
const processCrypto: PaymentProcessor = async (amount, details) => { /* ... */ };

async function checkout(amount: number, details: PaymentDetails, process: PaymentProcessor) {
  return process(amount, details);
}
```

No class hierarchy needed — TypeScript's type system ensures each processor matches the contract.
</example>
