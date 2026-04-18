# Single Responsibility Principle (SRP)

> A module should have one, and only one, reason to change.

## TypeScript Application

In TypeScript, SRP applies at multiple levels:

### Module Level (Most Common)

Each file should export functionality that changes for one reason.

```typescript
// BEFORE: Mixed responsibilities
// user-service.ts
export class UserService {
  constructor(private db: Database, private mailer: Mailer) {}

  async register(data: UserInput): Promise<User> {
    const user = this.validate(data);
    await this.db.insert('users', user);
    await this.mailer.send(user.email, 'Welcome!');
    return user;
  }

  private validate(data: UserInput): User {
    if (!data.email.includes('@')) throw new Error('Invalid email');
    return { id: crypto.randomUUID(), ...data };
  }
}
```

```typescript
// AFTER: Separated responsibilities
// user-validator.ts
export function validateUserInput(data: UserInput): User {
  if (!data.email.includes('@')) throw new Error('Invalid email');
  return { id: crypto.randomUUID(), ...data };
}

// user-repository.ts
export class UserRepository {
  constructor(private db: Database) {}
  async create(user: User): Promise<void> {
    await this.db.insert('users', user);
  }
}

// user-registration.ts — orchestration only
export class UserRegistration {
  constructor(
    private repo: UserRepository,
    private mailer: Mailer,
  ) {}

  async register(data: UserInput): Promise<User> {
    const user = validateUserInput(data);
    await this.repo.create(user);
    await this.mailer.send(user.email, 'Welcome!');
    return user;
  }
}
```

### Function Level

Functions should do one thing. If you can extract a meaningful sub-function, the original is doing too much.

### Detection Heuristics

1. **Count the verbs**: If a class/module description needs "and", it likely violates SRP
2. **Stakeholder test**: Would different people request changes to different parts?
3. **Import diversity**: If a module imports from many unrelated domains, it may have mixed concerns
4. **Test complexity**: If testing requires mocking many unrelated dependencies, SRP may be violated

### Bun-Specific Patterns

With Bun's file-based routing in `Bun.serve()`, SRP naturally maps to route handlers:

```typescript
// Each route handler has a single responsibility
Bun.serve({
  routes: {
    "/api/users": { GET: listUsers, POST: createUser },
    "/api/orders": { GET: listOrders, POST: createOrder },
  },
});
```

Keep handlers thin — delegate to domain functions.
