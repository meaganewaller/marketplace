# Interface Segregation Principle (ISP)

> No client should be forced to depend on methods it does not use.

## TypeScript Application

### Violation: Monolithic Interface

```typescript
// BAD: Components forced to implement or receive unused capabilities
interface UserService {
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(filter: UserFilter): Promise<User[]>;
  exportUsers(format: 'csv' | 'json'): Promise<Buffer>;
  importUsers(data: Buffer): Promise<number>;
  sendNotification(userId: string, msg: string): Promise<void>;
}
```

### Fix: Role-Based Interfaces

```typescript
// GOOD: Split by consumer need
interface UserReader {
  getUser(id: string): Promise<User>;
  listUsers(filter: UserFilter): Promise<User[]>;
}

interface UserWriter {
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface UserImportExport {
  exportUsers(format: 'csv' | 'json'): Promise<Buffer>;
  importUsers(data: Buffer): Promise<number>;
}

interface UserNotifier {
  sendNotification(userId: string, msg: string): Promise<void>;
}

// Components depend only on what they need
function UserProfile({ userService }: { userService: UserReader }) {
  // Only has access to read operations
}
```

### TypeScript-Specific Patterns

#### Pick and Omit for Ad-Hoc Segregation

```typescript
interface FullConfig {
  host: string;
  port: number;
  database: string;
  poolSize: number;
  ssl: boolean;
  timeout: number;
}

// Function only needs connection info
function connect(config: Pick<FullConfig, 'host' | 'port' | 'database'>) {
  // ...
}
```

#### Function Parameters Over Object Interfaces

```typescript
// Instead of requiring an object interface
// let consumers pass just what's needed
function formatUserName(
  user: { firstName: string; lastName: string },
): string {
  return `${user.firstName} ${user.lastName}`;
}

// Works with any object that has these fields — structural typing IS ISP
```

### Detection Heuristics

1. **Unused imports**: If consumers import an interface but only use 2 of 8 methods
2. **Empty implementations**: Methods that return `null` or throw `NotImplemented`
3. **Test mocking pain**: Mocking 10 methods when testing code that uses 2
4. **Parameter objects with mostly-unused fields**
