# Conditional and Mapped Types

## Conditional Types

```typescript
// Extract return type if function, otherwise identity
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>;          // number

// Deep unwrap
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;

// Conditional type for API responses
type ApiResponse<T> = T extends void
  ? { success: true }
  : { success: true; data: T };
```

## Mapped Types

```typescript
// Make all properties optional recursively
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// Make all properties readonly recursively
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Convert object type to getter interface
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};

interface User { name: string; age: number; }
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

## Template Literal Types

```typescript
// Type-safe event names
type DomainEvent<Entity extends string, Action extends string> = `${Entity}:${Action}`;

type UserEvent = DomainEvent<'user', 'created' | 'updated' | 'deleted'>;
// 'user:created' | 'user:updated' | 'user:deleted'

// Route parameter extraction
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<'/api/users/:userId/orders/:orderId'>;
// 'userId' | 'orderId'
```

## Utility Type Composition

```typescript
// Require at least one property from a set
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Omit<T, Keys> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// Make specific properties required
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Strongly typed Object.keys
function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

// Type-safe omit that errors on non-existent keys
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
```

## Discriminated Union Utilities

```typescript
// Extract a specific variant from a discriminated union
type ExtractVariant<T, K extends string, V> = T extends { [key in K]: V } ? T : never;

type OrderState =
  | { status: 'pending'; createdAt: Date }
  | { status: 'shipped'; trackingId: string }
  | { status: 'delivered'; deliveredAt: Date };

type ShippedOrder = ExtractVariant<OrderState, 'status', 'shipped'>;
// { status: 'shipped'; trackingId: string }
```
