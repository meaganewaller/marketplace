# Creational Patterns in TypeScript

## Factory Function

The most common creational pattern in TypeScript. Prefer over class-based Factory Method.

```typescript
// Type-safe factory with discriminated unions
type NotificationChannel = 'email' | 'sms' | 'push';

interface Notification {
  send(to: string, message: string): Promise<void>;
}

function createNotification(channel: NotificationChannel): Notification {
  switch (channel) {
    case 'email':
      return {
        async send(to, message) {
          // Email implementation
        },
      };
    case 'sms':
      return {
        async send(to, message) {
          // SMS implementation
        },
      };
    case 'push':
      return {
        async send(to, message) {
          // Push notification implementation
        },
      };
    default:
      return channel satisfies never;
  }
}
```

## Builder Pattern

Use when constructing complex objects with many optional parameters.

```typescript
interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
  rateLimit: number | null;
  routes: Map<string, RouteHandler>;
}

class ServerBuilder {
  private config: ServerConfig = {
    port: 3000,
    host: 'localhost',
    cors: false,
    rateLimit: null,
    routes: new Map(),
  };

  port(port: number): this {
    this.config.port = port;
    return this;
  }

  host(host: string): this {
    this.config.host = host;
    return this;
  }

  withCors(): this {
    this.config.cors = true;
    return this;
  }

  withRateLimit(requestsPerMinute: number): this {
    this.config.rateLimit = requestsPerMinute;
    return this;
  }

  route(path: string, handler: RouteHandler): this {
    this.config.routes.set(path, handler);
    return this;
  }

  build(): ServerConfig {
    return { ...this.config, routes: new Map(this.config.routes) };
  }
}

// Usage
const config = new ServerBuilder()
  .port(8080)
  .withCors()
  .withRateLimit(100)
  .route('/api/health', healthHandler)
  .build();
```

### Alternative: Options Object (Simpler)

```typescript
// Often a plain options object with defaults is enough
interface ServerOptions {
  port?: number;
  host?: string;
  cors?: boolean;
  rateLimit?: number;
}

function createServer(options: ServerOptions = {}) {
  const config = {
    port: 3000,
    host: 'localhost',
    cors: false,
    rateLimit: undefined,
    ...options,
  };
  return Bun.serve({ port: config.port /* ... */ });
}
```

Use Builder when: construction has validation, ordering constraints, or complex defaults. Use options object when: it's just optional configuration.

## Module-Scope Singleton

```typescript
// database.ts — module scope IS the singleton
const sql = Bun.sql;

export function getDatabase() {
  return sql;
}

// Every importer gets the same instance — no Singleton class needed
```

**Avoid** the class-based singleton pattern in TypeScript. ES modules already provide single-evaluation semantics.
