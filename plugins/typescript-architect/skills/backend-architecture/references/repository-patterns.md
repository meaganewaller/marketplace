# Repository and Data Access Patterns

## Repository Interface

```typescript
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findMany(options?: { offset?: number; limit?: number }): Promise<T[]>;
  count(): Promise<number>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## Bun.sql Repository Implementation

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
}

function createUserRepository(sql: ReturnType<typeof Bun.sql>): UserRepository {
  return {
    async findById(id) {
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      return user ?? null;
    },

    async findByEmail(email) {
      const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
      return user ?? null;
    },

    async findMany({ offset = 0, limit = 20 } = {}) {
      return sql`SELECT * FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    },

    async count() {
      const [{ count }] = await sql`SELECT count(*)::int FROM users`;
      return count;
    },

    async create(data) {
      const id = crypto.randomUUID();
      const [user] = await sql`
        INSERT INTO users (id, name, email, created_at)
        VALUES (${id}, ${data.name}, ${data.email}, ${data.createdAt})
        RETURNING *
      `;
      return user;
    },

    async update(id, data) {
      // Build dynamic update — only set provided fields
      const sets: string[] = [];
      const values: unknown[] = [];

      if (data.name !== undefined) { sets.push('name'); values.push(data.name); }
      if (data.email !== undefined) { sets.push('email'); values.push(data.email); }

      if (sets.length === 0) {
        const existing = await sql`SELECT * FROM users WHERE id = ${id}`;
        return existing[0];
      }

      const [user] = await sql`
        UPDATE users SET ${sql(data, ...sets)} WHERE id = ${id} RETURNING *
      `;
      return user;
    },

    async delete(id) {
      await sql`DELETE FROM users WHERE id = ${id}`;
    },
  };
}
```

## SQLite Repository (Bun built-in)

```typescript
import { Database } from 'bun:sqlite';

function createSqliteUserRepository(db: Database): UserRepository {
  // Prepared statements for performance
  const findByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const findByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const insertStmt = db.prepare(
    'INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?) RETURNING *',
  );

  return {
    async findById(id) {
      return findByIdStmt.get(id) as User | null;
    },

    async findByEmail(email) {
      return findByEmailStmt.get(email) as User | null;
    },

    async create(data) {
      const id = crypto.randomUUID();
      return insertStmt.get(id, data.name, data.email, data.createdAt.toISOString()) as User;
    },

    // ... other methods
  };
}
```

## In-Memory Repository (For Testing)

```typescript
function createInMemoryRepository<T extends { id: string }>(): Repository<T> {
  const store = new Map<string, T>();

  return {
    async findById(id) { return store.get(id) ?? null; },
    async findMany({ offset = 0, limit = 20 } = {}) {
      return [...store.values()].slice(offset, offset + limit);
    },
    async count() { return store.size; },
    async create(data) {
      const item = { id: crypto.randomUUID(), ...data } as T;
      store.set(item.id, item);
      return item;
    },
    async update(id, data) {
      const existing = store.get(id);
      if (!existing) throw new Error('Not found');
      const updated = { ...existing, ...data } as T;
      store.set(id, updated);
      return updated;
    },
    async delete(id) { store.delete(id); },
  };
}
```

## Query Builder Pattern

For complex queries, use a composable query builder:

```typescript
interface QueryOptions<T> {
  where?: Partial<T>;
  orderBy?: { field: keyof T; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

// This keeps raw SQL in the repository while exposing a clean interface to services
```
