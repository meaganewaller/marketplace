# Open-Closed Principle (OCP)

> Software entities should be open for extension but closed for modification.

## TypeScript Application

### Discriminated Unions (Preferred in TypeScript)

```typescript
// BEFORE: Switch that grows with each new type
function calculateArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    // Must modify this function for every new shape
  }
}
```

```typescript
// AFTER: Exhaustive discriminated union
type Shape =
  | { type: 'circle'; radius: number }
  | { type: 'rectangle'; width: number; height: number }
  | { type: 'triangle'; base: number; height: number };

// TypeScript enforces exhaustiveness — adding a new variant
// causes compile errors at all switch sites
function calculateArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle': return 0.5 * shape.base * shape.height;
    default: return shape satisfies never; // Exhaustiveness check
  }
}
```

### Strategy Pattern with Functions

```typescript
type PricingStrategy = (basePrice: number, quantity: number) => number;

const standardPricing: PricingStrategy = (price, qty) => price * qty;
const bulkPricing: PricingStrategy = (price, qty) =>
  qty >= 10 ? price * qty * 0.9 : price * qty;

// Open for extension: add new strategies without modifying existing code
function calculateTotal(
  items: CartItem[],
  strategy: PricingStrategy,
): number {
  return items.reduce((sum, item) => sum + strategy(item.price, item.qty), 0);
}
```

### Plugin/Registry Pattern

```typescript
type Middleware = (req: Request, next: () => Promise<Response>) => Promise<Response>;

class Pipeline {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(req: Request): Promise<Response> {
    // Closed for modification, open for extension via .use()
  }
}
```

### When OCP Doesn't Apply

- If the set of variants is genuinely fixed (e.g., HTTP methods)
- If you only have 1-2 cases — don't abstract prematurely
- If the switch is in a single location and unlikely to grow
