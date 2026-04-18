# Service Layer Patterns

## Service Structure

Services contain business logic and orchestrate between repositories.

```typescript
// Type-safe Result for service returns
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
function err<E>(error: E): Result<never, E> { return { ok: false, error }; }

// Service interface
interface UserService {
  findById(id: string): Promise<User | null>;
  list(options: ListOptions): Promise<PaginatedResult<User>>;
  create(input: CreateUserInput): Promise<Result<User>>;
  update(id: string, input: UpdateUserInput): Promise<Result<User>>;
  delete(id: string): Promise<Result<void>>;
}

// Service implementation
function createUserService(
  users: UserRepository,
  events?: EventEmitter,
): UserService {
  return {
    async findById(id) {
      return users.findById(id);
    },

    async list({ page = 1, perPage = 20 }) {
      const [items, total] = await Promise.all([
        users.findMany({ offset: (page - 1) * perPage, limit: perPage }),
        users.count(),
      ]);
      return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    },

    async create(input) {
      // Validation — business rules live here
      if (!input.email.includes('@')) return err('Invalid email');

      const existing = await users.findByEmail(input.email);
      if (existing) return err('Email already taken');

      const user = await users.create({
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      });

      events?.emit('user:created', { user });
      return ok(user);
    },

    async update(id, input) {
      const existing = await users.findById(id);
      if (!existing) return err('User not found');

      const updated = await users.update(id, input);
      return ok(updated);
    },

    async delete(id) {
      const existing = await users.findById(id);
      if (!existing) return err('User not found');

      await users.delete(id);
      events?.emit('user:deleted', { userId: id });
      return ok(undefined);
    },
  };
}
```

## Service Composition

When one service needs another, inject the interface — never the implementation.

```typescript
function createOrderService(
  orders: OrderRepository,
  users: Pick<UserService, 'findById'>, // Only depend on what you need (ISP)
): OrderService {
  return {
    async createOrder(userId: string, items: OrderItem[]) {
      const user = await users.findById(userId);
      if (!user) return err('User not found');

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return ok(await orders.create({ userId, items, total }));
    },
  };
}
```

## Validation Patterns

```typescript
// Validation as composable functions
type Validator<T> = (input: T) => string | null;

function validate<T>(input: T, ...validators: Validator<T>[]): string[] {
  return validators
    .map(v => v(input))
    .filter((err): err is string => err !== null);
}

// Reusable validators
const emailRequired: Validator<{ email?: string }> = (input) =>
  !input.email?.includes('@') ? 'Valid email is required' : null;

const nameRequired: Validator<{ name?: string }> = (input) =>
  !input.name?.trim() ? 'Name is required' : null;

// In service
async create(input: CreateUserInput) {
  const errors = validate(input, emailRequired, nameRequired);
  if (errors.length > 0) return err(errors.join('; '));
  // ...
}
```

## Transaction Patterns with Bun.sql

```typescript
async function transferFunds(
  sql: ReturnType<typeof Bun.sql>,
  from: string,
  to: string,
  amount: number,
): Promise<Result<void>> {
  try {
    await sql.begin(async (tx) => {
      const [sender] = await tx`
        SELECT balance FROM accounts WHERE id = ${from} FOR UPDATE
      `;
      if (sender.balance < amount) throw new Error('Insufficient funds');

      await tx`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${from}`;
      await tx`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${to}`;
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Transfer failed');
  }
}
```
