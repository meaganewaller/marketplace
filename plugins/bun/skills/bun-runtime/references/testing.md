# Testing with Bun

Bun has a built-in test runner: `bun:test`. No external dependencies needed.

## Basic Setup

```typescript
// example.test.ts
import { test, expect, describe, beforeAll, afterAll } from "bun:test";

describe("MyModule", () => {
  beforeAll(() => {
    // Setup before all tests
  });

  afterAll(() => {
    // Cleanup after all tests
  });

  test("should work", () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific file
bun test src/utils.test.ts

# Run tests matching pattern
bun test --grep "should work"

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# Bail on first failure
bun test --bail
```

## Assertions

```typescript
import { expect } from "bun:test";

// Equality
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toStrictEqual(expected);  // Deep + type equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(num).toBeGreaterThan(3);
expect(num).toBeLessThan(10);
expect(num).toBeCloseTo(0.3, 5);  // Floating point

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain("substring");

// Arrays
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("key", "value");

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("message");
expect(() => fn()).toThrow(ErrorClass);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Mocking

```typescript
import { mock, spyOn } from "bun:test";

// Mock function
const fn = mock(() => "mocked");
fn();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(1);

// Spy on object method
const obj = { method: () => "original" };
const spy = spyOn(obj, "method").mockReturnValue("mocked");
expect(obj.method()).toBe("mocked");
spy.mockRestore();

// Mock implementation
const mockFn = mock((x: number) => x * 2);
mockFn.mockImplementation((x) => x * 3);

// Mock return values
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(99);

// Mock resolved/rejected values
mockFn.mockResolvedValue("async result");
mockFn.mockRejectedValue(new Error("failed"));
```

## Async Testing

```typescript
import { test, expect } from "bun:test";

// Async/await
test("async test", async () => {
  const result = await fetchData();
  expect(result).toBe("data");
});

// With timeout
test("slow test", async () => {
  await longOperation();
}, 10000); // 10 second timeout

// Testing timers
import { setSystemTime } from "bun:test";

test("timer test", () => {
  setSystemTime(new Date("2024-01-01"));
  expect(new Date().getFullYear()).toBe(2024);
  setSystemTime(); // Reset
});
```

## Lifecycle Hooks

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";

beforeAll(() => {
  // Once before all tests in file
});

afterAll(() => {
  // Once after all tests in file
});

beforeEach(() => {
  // Before each test
});

afterEach(() => {
  // After each test
});
```

## Snapshot Testing

```typescript
import { test, expect } from "bun:test";

test("snapshot", () => {
  const obj = { name: "test", value: 123 };
  expect(obj).toMatchSnapshot();
});
```

```bash
# Update snapshots
bun test --update-snapshots
```

## Configuration

```toml
# bunfig.toml
[test]
# Test file patterns
include = ["**/*.test.ts", "**/*.spec.ts"]

# Exclude patterns
exclude = ["node_modules", "dist"]

# Coverage settings
coverage = true
coverageDir = "coverage"
```

## Best Practices

1. **Name tests clearly**: Describe behavior, not implementation
2. **One assertion per test**: When practical, focus tests
3. **Arrange-Act-Assert**: Structure tests consistently
4. **Avoid test interdependence**: Each test should be isolated
5. **Mock at boundaries**: Mock external services, not internal code

```typescript
// Good
test("returns user when found", async () => {
  const user = await getUser(1);
  expect(user.name).toBe("Alice");
});

// Bad
test("test1", async () => {
  // What does this test?
});
```
