# Branded (Opaque) Types

Branded types prevent mixing structurally identical but semantically different values.

## The Pattern

```typescript
// Brand symbol — unique per type
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// Domain-specific IDs
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type ProductId = Brand<string, 'ProductId'>;

// Constructor functions with validation
function userId(value: string): UserId {
  if (!value.startsWith('usr_')) throw new Error(`Invalid user ID: ${value}`);
  return value as UserId;
}

function orderId(value: string): OrderId {
  if (!value.startsWith('ord_')) throw new Error(`Invalid order ID: ${value}`);
  return value as OrderId;
}
```

## Branded Primitives for Domain Rules

```typescript
// Validated email — can only be created through validation
type Email = Brand<string, 'Email'>;

function email(value: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`Invalid email: ${value}`);
  }
  return value as Email;
}

// Positive integer — guaranteed > 0
type PositiveInt = Brand<number, 'PositiveInt'>;

function positiveInt(value: number): PositiveInt {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected positive integer, got: ${value}`);
  }
  return value as PositiveInt;
}

// Now functions express their requirements in types
function sendEmail(to: Email, subject: string): Promise<void> {
  // `to` is guaranteed to be a valid email
}

function paginate<T>(items: T[], page: PositiveInt, perPage: PositiveInt): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}
```

## Branded Types with Bun

```typescript
// Database column types
type SqlTimestamp = Brand<string, 'SqlTimestamp'>;
type JsonColumn<T> = Brand<string, 'JsonColumn'> & { readonly __data: T };

// Safe SQL query building
type TableName = Brand<string, 'TableName'>;
const ALLOWED_TABLES = ['users', 'orders', 'products'] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

function table(name: AllowedTable): TableName {
  return name as TableName;
}
```

## When to Use Branded Types

- **ID confusion**: Multiple string IDs that should not be mixed
- **Validated data**: Values that have passed validation (Email, URL, PhoneNumber)
- **Units**: Meters vs Feet, Cents vs Dollars, Seconds vs Milliseconds
- **Security boundaries**: Sanitized HTML, escaped SQL, hashed passwords

## When NOT to Use

- Single ID type in a small module
- Internal variables that never cross function boundaries
- Prototype or throwaway code
