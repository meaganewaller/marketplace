# TypeScript Anti-Patterns Catalog

## Primitive Obsession

Using primitive types where domain types would be safer.

```typescript
// BAD: Everything is a string
function createOrder(userId: string, productId: string, quantity: number): void
createOrder(productId, userId, 5); // Swapped args — no compiler error!

// GOOD: Branded types prevent mixups
function createOrder(userId: UserId, productId: ProductId, quantity: PositiveInt): void
createOrder(productId, userId, 5); // Compiler error!
```

## God Object / God Module

A single class or module that knows too much and does too much.

**Detection:**

- File > 400 lines
- > 10 methods on a class
- > 10 imports
- Multiple unrelated public methods

**Fix:** Split by responsibility. Each resulting module should be describable in one sentence without "and."

## Anemic Domain Model

Domain objects are just data bags, all logic lives in services.

```typescript
// BAD: Anemic — logic separated from data
interface Order { items: Item[]; status: string; }

class OrderService {
  calculateTotal(order: Order): number { /* ... */ }
  canCancel(order: Order): boolean { /* ... */ }
  cancel(order: Order): Order { /* ... */ }
}

// BETTER: Rich — behavior lives with data
interface Order {
  items: readonly Item[];
  status: OrderStatus;
  readonly total: number;
  canCancel(): boolean;
  cancel(): Order;
}
```

**Note:** In TypeScript, rich domain models often work better as factory functions returning objects with methods, not classes.

## Stringly Typed Code

Using strings where enums or union types belong.

```typescript
// BAD
function setStatus(status: string) { /* ... */ }
setStatus('actve'); // Typo — no error

// GOOD
type Status = 'active' | 'inactive' | 'suspended';
function setStatus(status: Status) { /* ... */ }
setStatus('actve'); // Compile error!
```

## Callback Hell / Promise Chains

```typescript
// BAD: Nested callbacks
getUser(id, (user) => {
  getOrders(user.id, (orders) => {
    getPayments(orders[0].id, (payments) => {
      // ...
    });
  });
});

// GOOD: async/await
const user = await getUser(id);
const orders = await getOrders(user.id);
const payments = await getPayments(orders[0].id);
```

## Excessive Type Assertions

```typescript
// BAD: Assertions everywhere
const data = JSON.parse(body) as UserInput;
const user = result as User;
const id = params.id as string;

// GOOD: Validate and narrow
function isUserInput(data: unknown): data is UserInput {
  return typeof data === 'object' && data !== null && 'email' in data;
}

const data: unknown = JSON.parse(body);
if (!isUserInput(data)) return Response.json({ error: 'Invalid input' }, { status: 400 });
// data is now typed as UserInput
```

## Premature Abstraction

```typescript
// BAD: Abstract base class with one implementation
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T>;
  abstract create(data: T): Promise<T>;
  // 20 more abstract methods
}

class UserRepository extends BaseRepository<User> {
  // Forced to implement everything, even unused methods
}

// GOOD: Start concrete, abstract when you have 3+ implementations
function createUserRepository(sql: typeof Bun.sql) {
  return {
    async findById(id: string) { /* ... */ },
    async create(data: UserInput) { /* ... */ },
  };
}
```

## Boolean Blindness

```typescript
// BAD: What do these booleans mean?
processOrder(order, true, false, true);

// GOOD: Use options object or separate functions
processOrder(order, {
  expedited: true,
  giftWrap: false,
  sendNotification: true,
});
```
