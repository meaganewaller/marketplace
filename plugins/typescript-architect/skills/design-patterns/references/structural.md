# Structural Patterns in TypeScript

## Decorator / Wrapper

Add behavior without modifying the original. In TypeScript, prefer function composition over class decorators.

### Function Composition Approach

```typescript
type Handler = (req: Request) => Promise<Response>;

// Decorator: add logging
function withLogging(handler: Handler): Handler {
  return async (req) => {
    const start = performance.now();
    const res = await handler(req);
    console.log(`${req.method} ${req.url} → ${res.status} (${(performance.now() - start).toFixed(1)}ms)`);
    return res;
  };
}

// Decorator: add authentication
function withAuth(handler: Handler): Handler {
  return async (req) => {
    const token = req.headers.get('Authorization');
    if (!token) return new Response('Unauthorized', { status: 401 });
    return handler(req);
  };
}

// Compose decorators
const secureEndpoint = withLogging(withAuth(async (req) => {
  return Response.json({ data: 'secret' });
}));
```

### Middleware Pipeline

```typescript
type Middleware = (req: Request, next: () => Promise<Response>) => Promise<Response>;

function createPipeline(middlewares: Middleware[], handler: Handler): Handler {
  return (req) => {
    let index = 0;
    const next = (): Promise<Response> => {
      if (index < middlewares.length) {
        return middlewares[index++](req, next);
      }
      return handler(req);
    };
    return next();
  };
}
```

## Facade

Simplify complex subsystem interactions behind a clean interface.

```typescript
// Complex subsystems
class InventorySystem { /* complex inventory logic */ }
class PaymentGateway { /* complex payment logic */ }
class ShippingService { /* complex shipping logic */ }

// Facade: simple interface for order placement
class OrderFacade {
  constructor(
    private inventory: InventorySystem,
    private payments: PaymentGateway,
    private shipping: ShippingService,
  ) {}

  async placeOrder(order: OrderInput): Promise<OrderResult> {
    const available = await this.inventory.check(order.items);
    if (!available) return { success: false, reason: 'out-of-stock' };

    const payment = await this.payments.charge(order.paymentMethod, order.total);
    if (!payment.success) return { success: false, reason: 'payment-failed' };

    const shipment = await this.shipping.schedule(order.address, order.items);
    await this.inventory.reserve(order.items);

    return { success: true, shipmentId: shipment.id };
  }
}
```

## Adapter

Convert one interface to another. Common when integrating third-party APIs.

```typescript
// Your application's interface
interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error): void;
}

// Third-party logger has different interface
import { ExternalLogger } from 'some-logging-lib';

// Adapter bridges the gap
function createLoggerAdapter(external: ExternalLogger): Logger {
  return {
    info(message, context) {
      external.log({ level: 'INFO', msg: message, ...context });
    },
    error(message, error) {
      external.log({ level: 'ERROR', msg: message, stack: error?.stack });
    },
  };
}
```

## Proxy

Control access to an object. Useful for caching, lazy loading, access control.

```typescript
function withCache<T extends Record<string, (...args: unknown[]) => Promise<unknown>>>(
  service: T,
  ttlMs: number,
): T {
  const cache = new Map<string, { value: unknown; expires: number }>();

  return new Proxy(service, {
    get(target, prop: string) {
      const original = target[prop];
      if (typeof original !== 'function') return original;

      return async (...args: unknown[]) => {
        const key = `${prop}:${JSON.stringify(args)}`;
        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) return cached.value;

        const value = await original.apply(target, args);
        cache.set(key, { value, expires: Date.now() + ttlMs });
        return value;
      };
    },
  }) as T;
}
```
