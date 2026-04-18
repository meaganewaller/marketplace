# Generic Type Patterns

## Constrained Generics

```typescript
// Constrain to objects with an id
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Constrain to specific keys
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

// Constrain return type based on input
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Generic Factories

```typescript
// Type-safe factory with generic constraint
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T>;
  delete(id: string): Promise<void>;
}

function createInMemoryRepository<T extends { id: string }>(): Repository<T> {
  const items = new Map<string, T>();

  return {
    async findById(id) {
      return items.get(id) ?? null;
    },
    async findAll() {
      return [...items.values()];
    },
    async create(data) {
      const item = { id: crypto.randomUUID(), ...data } as T;
      items.set(item.id, item);
      return item;
    },
    async update(id, data) {
      const existing = items.get(id);
      if (!existing) throw new Error(`Not found: ${id}`);
      const updated = { ...existing, ...data };
      items.set(id, updated);
      return updated;
    },
    async delete(id) {
      items.delete(id);
    },
  };
}
```

## Generic Utility Functions

```typescript
// Type-safe groupBy
function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      const key = keyFn(item);
      (groups[key] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

// Type-safe result type
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage
async function parseConfig(path: string): Promise<Result<Config, string>> {
  try {
    const file = Bun.file(path);
    if (!await file.exists()) return err(`File not found: ${path}`);
    const data = await file.json();
    return ok(data as Config);
  } catch (e) {
    return err(`Parse error: ${e}`);
  }
}
```

## Inference Patterns

```typescript
// Infer return type from implementation
function createActions<T extends Record<string, (...args: never[]) => unknown>>(actions: T): T {
  return actions;
}

// TypeScript infers the full type from the object literal
const userActions = createActions({
  create: (name: string, email: string) => ({ name, email }),
  rename: (id: string, newName: string) => ({ id, newName }),
});
// typeof userActions.create = (name: string, email: string) => { name: string; email: string }
```
