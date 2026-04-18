# Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types without altering program correctness.

## TypeScript Application

### Violation: Throwing on Inherited Methods

```typescript
// BAD: ReadOnlyRepository breaks the contract of Repository
interface Repository<T> {
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
}

class ReadOnlyRepository<T> implements Repository<T> {
  async findAll(): Promise<T[]> { /* ... */ }
  async save(_entity: T): Promise<void> {
    throw new Error('Cannot save to read-only repository'); // LSP violation
  }
}
```

```typescript
// GOOD: Separate interfaces by capability
interface Readable<T> {
  findAll(): Promise<T[]>;
}

interface Writable<T> {
  save(entity: T): Promise<void>;
}

interface Repository<T> extends Readable<T>, Writable<T> {}

// ReadOnlyRepository only implements what it can fulfill
class ReadOnlyRepository<T> implements Readable<T> {
  async findAll(): Promise<T[]> { /* ... */ }
}
```

### Violation: Strengthening Preconditions

```typescript
// BAD: Subclass requires non-empty array, but base accepts any array
class BaseProcessor {
  process(items: string[]): string[] {
    return items.map(i => i.toUpperCase());
  }
}

class StrictProcessor extends BaseProcessor {
  process(items: string[]): string[] {
    if (items.length === 0) throw new Error('Need at least one item'); // LSP violation
    return super.process(items);
  }
}
```

### Covariance and Contravariance

TypeScript's type system helps enforce LSP through structural typing:

```typescript
// Return types must be covariant (same or narrower)
interface Animal { name: string }
interface Dog extends Animal { breed: string }

interface AnimalFactory {
  create(): Animal;
}

// GOOD: Returning Dog (narrower) where Animal is expected
class DogFactory implements AnimalFactory {
  create(): Dog { return { name: 'Rex', breed: 'Lab' }; }
}
```

### Prefer Composition

When LSP is hard to maintain in a hierarchy, switch to composition:

```typescript
// Instead of inheritance hierarchies, compose behaviors
type Logger = { log(msg: string): void };
type Validator = { validate(data: unknown): boolean };

function createService(logger: Logger, validator: Validator) {
  return {
    process(data: unknown) {
      if (!validator.validate(data)) {
        logger.log('Invalid data');
        return;
      }
      // ...
    },
  };
}
```
