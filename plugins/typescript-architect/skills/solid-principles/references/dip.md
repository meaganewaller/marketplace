# Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

## TypeScript Application

### Violation: Direct Instantiation

```typescript
// BAD: Business logic directly coupled to infrastructure
import { Pool } from 'pg'; // Concrete dependency

class OrderService {
  private pool = new Pool(); // Hard-coded dependency

  async createOrder(data: OrderInput): Promise<Order> {
    const result = await this.pool.query(
      'INSERT INTO orders ...',
      [data.userId, data.total],
    );
    return result.rows[0];
  }
}
```

### Fix: Depend on Abstractions

```typescript
// GOOD: Business logic depends on interface
interface OrderRepository {
  create(data: OrderInput): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

class OrderService {
  constructor(private readonly orders: OrderRepository) {}

  async createOrder(data: OrderInput): Promise<Order> {
    // Business rules here — no knowledge of storage mechanism
    if (data.total <= 0) throw new Error('Invalid order total');
    return this.orders.create(data);
  }
}

// Infrastructure implements the interface
class BunPostgresOrderRepository implements OrderRepository {
  constructor(private sql: ReturnType<typeof Bun.sql>) {}

  async create(data: OrderInput): Promise<Order> {
    const [order] = await this.sql`
      INSERT INTO orders (user_id, total)
      VALUES (${data.userId}, ${data.total})
      RETURNING *
    `;
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const [order] = await this.sql`
      SELECT * FROM orders WHERE id = ${id}
    `;
    return order ?? null;
  }
}
```

### Factory Functions (Preferred over DI Containers in Bun/TS)

```typescript
// Composition root — wire dependencies at startup
function createApp() {
  // Low-level modules
  const sql = Bun.sql;
  const orderRepo = new BunPostgresOrderRepository(sql);
  const emailService = new ResendEmailService(process.env.RESEND_API_KEY!);

  // High-level modules receive abstractions
  const orderService = new OrderService(orderRepo);
  const notificationService = new NotificationService(emailService);

  return { orderService, notificationService };
}

// Entry point
const app = createApp();
Bun.serve({
  routes: {
    "/api/orders": {
      POST: async (req) => {
        const data = await req.json();
        const order = await app.orderService.createOrder(data);
        return Response.json(order, { status: 201 });
      },
    },
  },
});
```

### Testing Benefits

```typescript
// In tests, swap with in-memory implementation
import { test, expect } from 'bun:test';

class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  async create(data: OrderInput): Promise<Order> {
    const order = { id: crypto.randomUUID(), ...data };
    this.orders.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) ?? null;
  }
}

test('createOrder rejects zero total', async () => {
  const repo = new InMemoryOrderRepository();
  const service = new OrderService(repo);

  expect(
    service.createOrder({ userId: '1', total: 0 }),
  ).rejects.toThrow('Invalid order total');
});
```

### When to Skip DIP

- **Utility functions** (string formatting, math) — no abstraction needed
- **Framework-provided singletons** (Bun.serve, process.env) — abstract at boundary, not everywhere
- **Single implementation with no testing need** — don't create interfaces for their own sake
