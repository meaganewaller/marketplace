---
name: backend-architecture
description: Design backend architecture for Bun/TypeScript servers. Use when structuring APIs, designing service layers, implementing repository patterns, or organizing server-side code.
---

# Backend Architecture for Bun + TypeScript

Guidance for building maintainable server-side applications with Bun's built-in APIs.

## When to Use This Skill

Use this skill when:

- Structuring a Bun.serve() application
- Designing API routes and handlers
- Implementing service and repository layers
- Choosing data access patterns
- Organizing server-side modules
- Designing error handling strategies

## Core Architecture Principles

1. **Thin handlers**: Route handlers delegate to services — no business logic in handlers
2. **Domain-driven layers**: Handler → Service → Repository, each with clear responsibility
3. **Bun-native**: Use Bun.serve(), Bun.sql, Bun.file — not Express, pg, or fs
4. **Dependency injection via factories**: Wire dependencies at startup, not through DI containers
5. **Errors as values**: Use Result types over thrown exceptions in domain logic

## Layered Architecture

```text
Request → Handler → Service → Repository → Database
                  ↓
              Validation
```

| Layer | Responsibility | Depends On |
|-------|---------------|------------|
| **Handler** | Parse request, call service, format response | Service interfaces |
| **Service** | Business logic, orchestration, validation | Repository interfaces |
| **Repository** | Data access, query building | Database driver (Bun.sql) |
| **Domain** | Types, entities, value objects | Nothing |

## Bun.serve() Application Structure

```typescript
// server.ts — composition root
import { createApp } from './app';

const app = createApp();

Bun.serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    "/api/health": {
      GET: () => Response.json({ status: 'ok' }),
    },
    "/api/users": {
      GET: app.handlers.users.list,
      POST: app.handlers.users.create,
    },
    "/api/users/:id": {
      GET: app.handlers.users.getById,
      PUT: app.handlers.users.update,
      DELETE: app.handlers.users.remove,
    },
  },
});
```

## Handler Pattern

```typescript
// handlers/users.ts
import type { UserService } from '../services/user-service';

export function createUserHandlers(userService: UserService) {
  return {
    async list(req: Request): Promise<Response> {
      const url = new URL(req.url);
      const page = Number(url.searchParams.get('page')) || 1;
      const result = await userService.list({ page, perPage: 20 });
      return Response.json(result);
    },

    async create(req: Request): Promise<Response> {
      const body = await req.json();
      const result = await userService.create(body);
      if (!result.ok) {
        return Response.json({ error: result.error }, { status: 400 });
      }
      return Response.json(result.value, { status: 201 });
    },

    async getById(req: Request): Promise<Response> {
      const id = req.params.id;
      const user = await userService.findById(id);
      if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(user);
    },
  };
}
```

## Progressive Disclosure

For detailed patterns:

- **Service layer patterns** → Read `references/service-patterns.md`
- **Repository and data access** → Read `references/repository-patterns.md`
- **Error handling** → Read `references/error-handling.md`

## Composition Root

```typescript
// app.ts — wire everything together
export function createApp() {
  // Infrastructure
  const sql = Bun.sql;

  // Repositories
  const userRepo = createUserRepository(sql);
  const orderRepo = createOrderRepository(sql);

  // Services
  const userService = createUserService(userRepo);
  const orderService = createOrderService(orderRepo, userService);

  // Handlers
  const handlers = {
    users: createUserHandlers(userService),
    orders: createOrderHandlers(orderService),
  };

  return { handlers };
}
```

<example>
user: How do I structure my API to handle user registration with email verification?
assistant: I'll use the backend-architecture skill for this.

**Layer breakdown:**

1. **Handler** (`handlers/auth.ts`): Parse registration request, return 201 or 400
2. **Service** (`services/auth-service.ts`): Validate input, check duplicates, create user, trigger verification email
3. **Repository** (`repositories/user-repository.ts`): Insert user, query by email
4. **Domain** (`types/auth.ts`): `RegistrationInput`, `VerificationToken` branded types

```typescript
// services/auth-service.ts
export function createAuthService(
  users: UserRepository,
  mailer: EmailSender,
) {
  return {
    async register(input: RegistrationInput): Promise<Result<User, string>> {
      const existing = await users.findByEmail(input.email);
      if (existing) return err('Email already registered');

      const user = await users.create({
        email: input.email,
        passwordHash: await Bun.password.hash(input.password),
      });

      const token = crypto.randomUUID();
      await users.saveVerificationToken(user.id, token);
      await mailer.send(user.email, `Verify: /verify?token=${token}`);

      return ok(user);
    },
  };
}
```

Key: the handler doesn't know about password hashing or tokens. The service doesn't know about SQL. Clean separation.
</example>
