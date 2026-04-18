---
name: type-system-design
description: Design advanced TypeScript types for safety and expressiveness. Use when creating generic types, branded types, conditional types, mapped types, or designing type-safe APIs.
---

# TypeScript Type System Design

Guidance for leveraging TypeScript's type system to create safe, expressive, and maintainable code.

## When to Use This Skill

Use this skill when:

- Designing generic types or utility types
- Creating branded/opaque types for domain safety
- Building type-safe APIs with conditional or mapped types
- Choosing between `type` vs `interface`
- Debugging complex type errors
- Designing discriminated unions

## Core Principles

1. **Types encode business rules**: Use the type system to make invalid states unrepresentable
2. **Prefer narrowing over widening**: Start specific, widen only when needed
3. **Types are documentation**: Well-named types replace comments
4. **Avoid `any`**: Use `unknown` for truly unknown types, then narrow

## Quick Decision Guide

| Situation | Use | Why |
|-----------|-----|-----|
| Object shapes | `interface` | Extendable, better error messages |
| Unions, intersections, mapped | `type` | Only types support these |
| Function signatures | `type` | Cleaner syntax for function types |
| Module contracts | `interface` | Declaration merging if needed |
| Enum-like constants | `as const` + `type` | No runtime overhead |

## Making Invalid States Unrepresentable

```typescript
// BAD: Valid and invalid states are both representable
interface FormState {
  isLoading: boolean;
  data: User | null;
  error: string | null;
}
// Can have both data AND error, or isLoading with data — nonsense states

// GOOD: Discriminated union prevents invalid combinations
type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };
```

## Progressive Disclosure

For detailed patterns and techniques:

- **Generic patterns** → Read `references/generics.md`
- **Branded and opaque types** → Read `references/branded-types.md`
- **Conditional and mapped types** → Read `references/advanced-types.md`

## Exhaustiveness Checking

Always use `satisfies never` for exhaustive switches:

```typescript
function handleState(state: FormState): string {
  switch (state.status) {
    case 'idle': return 'Ready';
    case 'loading': return 'Loading...';
    case 'success': return state.data.name;
    case 'error': return state.error;
    default: return state satisfies never;
  }
}
```

## `as const` for Literal Types

```typescript
// Runtime values that also serve as types
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number]; // 'GET' | 'POST' | 'PUT' | 'DELETE'

const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL: 500,
} as const;
type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES]; // 200 | 404 | 500
```

## Type Narrowing Best Practices

```typescript
// Custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as User).id === 'string'
  );
}

// Assertion function
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value == null) throw new Error(`Expected ${name} to be defined`);
}
```

<example>
user: I keep accidentally passing user IDs where order IDs are expected
assistant: I'll use the type-system-design skill for this. You need **branded types** to distinguish structurally identical types.

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function userId(id: string): UserId { return id as UserId; }
function orderId(id: string): OrderId { return id as OrderId; }

function getOrder(id: OrderId): Promise<Order> { /* ... */ }

const uid = userId('abc');
getOrder(uid); // Type error! Can't pass UserId as OrderId
```

See `references/branded-types.md` for the full pattern with validation.
</example>
