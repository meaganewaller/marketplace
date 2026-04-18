# Behavioral Patterns in TypeScript

## Strategy

Interchangeable algorithms. In TypeScript, use typed functions instead of class hierarchies.

```typescript
type SortStrategy<T> = (items: T[]) => T[];

const byName: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name));

const byDate: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

const byRelevance: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => b.score - a.score);

function displayUsers(users: User[], sort: SortStrategy<User>): User[] {
  return sort(users);
}
```

## Observer / Event Emitter

Decouple producers from consumers. Use TypeScript's type system for type-safe events.

```typescript
type EventMap = {
  'user:created': { user: User };
  'user:deleted': { userId: string };
  'order:placed': { order: Order; user: User };
};

class TypedEventEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<(data: never) => void>>();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler as (data: never) => void);

    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(handler as (data: never) => void);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach((handler) => handler(data as never));
  }
}

// Usage
const events = new TypedEventEmitter<EventMap>();

events.on('user:created', ({ user }) => {
  console.log(`Welcome ${user.name}`);
});
```

## Command

Encapsulate operations as objects for undo/redo, queuing, or logging.

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  description: string;
}

class CommandHistory {
  private executed: Command[] = [];
  private undone: Command[] = [];

  async execute(command: Command): Promise<void> {
    await command.execute();
    this.executed.push(command);
    this.undone = []; // Clear redo stack
  }

  async undo(): Promise<void> {
    const command = this.executed.pop();
    if (!command) return;
    await command.undo();
    this.undone.push(command);
  }

  async redo(): Promise<void> {
    const command = this.undone.pop();
    if (!command) return;
    await command.execute();
    this.executed.push(command);
  }
}
```

## State Machine

Use discriminated unions for type-safe state machines.

```typescript
type OrderState =
  | { status: 'pending'; createdAt: Date }
  | { status: 'confirmed'; confirmedAt: Date }
  | { status: 'shipped'; trackingNumber: string; shippedAt: Date }
  | { status: 'delivered'; deliveredAt: Date }
  | { status: 'cancelled'; reason: string; cancelledAt: Date };

function transition(state: OrderState, event: OrderEvent): OrderState {
  switch (state.status) {
    case 'pending':
      if (event.type === 'confirm') return { status: 'confirmed', confirmedAt: new Date() };
      if (event.type === 'cancel') return { status: 'cancelled', reason: event.reason, cancelledAt: new Date() };
      throw new Error(`Cannot ${event.type} a pending order`);

    case 'confirmed':
      if (event.type === 'ship') return { status: 'shipped', trackingNumber: event.tracking, shippedAt: new Date() };
      if (event.type === 'cancel') return { status: 'cancelled', reason: event.reason, cancelledAt: new Date() };
      throw new Error(`Cannot ${event.type} a confirmed order`);

    case 'shipped':
      if (event.type === 'deliver') return { status: 'delivered', deliveredAt: new Date() };
      throw new Error(`Cannot ${event.type} a shipped order`);

    default:
      throw new Error(`Order in terminal state: ${state.status}`);
  }
}
```

## Chain of Responsibility

Process through a chain of handlers. Natural fit for request validation.

```typescript
type Validator<T> = (data: T) => string | null; // null = valid, string = error

function createValidationChain<T>(...validators: Validator<T>[]): Validator<T> {
  return (data) => {
    for (const validate of validators) {
      const error = validate(data);
      if (error) return error;
    }
    return null;
  };
}

// Compose validators
const validateUser = createValidationChain<UserInput>(
  (data) => !data.email?.includes('@') ? 'Invalid email' : null,
  (data) => data.name.length < 2 ? 'Name too short' : null,
  (data) => data.age < 0 ? 'Invalid age' : null,
);
```
