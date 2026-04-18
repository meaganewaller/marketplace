# Error Handling Patterns

## Result Type (Domain Layer)

Use Result types in services for expected failures. Reserve exceptions for unexpected errors.

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helpers
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Chaining results
function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

async function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>,
): Promise<Result<U, E>> {
  return result.ok ? fn(result.value) : result;
}
```

## Error Types (Typed Errors)

```typescript
type AppError =
  | { code: 'NOT_FOUND'; entity: string; id: string }
  | { code: 'VALIDATION'; fields: Record<string, string> }
  | { code: 'CONFLICT'; message: string }
  | { code: 'UNAUTHORIZED' }
  | { code: 'FORBIDDEN'; reason: string };

// Map domain errors to HTTP responses
function errorToResponse(error: AppError): Response {
  switch (error.code) {
    case 'NOT_FOUND':
      return Response.json(
        { error: `${error.entity} not found` },
        { status: 404 },
      );
    case 'VALIDATION':
      return Response.json(
        { error: 'Validation failed', fields: error.fields },
        { status: 400 },
      );
    case 'CONFLICT':
      return Response.json(
        { error: error.message },
        { status: 409 },
      );
    case 'UNAUTHORIZED':
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    case 'FORBIDDEN':
      return Response.json(
        { error: error.reason },
        { status: 403 },
      );
    default:
      return error satisfies never;
  }
}
```

## Handler-Level Error Boundary

```typescript
// Wrap handlers to catch unexpected errors
function withErrorBoundary(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Unhandled error:', error);

      // Never leak internal errors to clients
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}

// Apply to all routes
const routes = {
  "/api/users": {
    GET: withErrorBoundary(handlers.users.list),
    POST: withErrorBoundary(handlers.users.create),
  },
};
```

## Error Hierarchy Guidelines

| Error Type | Where to Handle | Pattern |
|-----------|----------------|---------|
| Validation | Service layer | `Result<T, ValidationError>` |
| Not found | Service layer | `Result<T, NotFoundError>` or `null` |
| Auth/authz | Middleware/handler | Early return with 401/403 |
| Database | Repository (catch + rethrow as domain error) | Try/catch → Result |
| Network | Service (retry + circuit breaker) | Result with retry logic |
| Unexpected | Handler error boundary | Try/catch → 500 |

## Anti-Patterns

```typescript
// BAD: Throwing for control flow
function findUser(id: string): User {
  const user = db.find(id);
  if (!user) throw new Error('Not found'); // Don't throw for expected cases
  return user;
}

// GOOD: Return null or Result for expected cases
function findUser(id: string): User | null {
  return db.find(id) ?? null;
}

// BAD: Catching and ignoring
try { await riskyOperation(); } catch { /* silently swallowed */ }

// GOOD: Catch and handle explicitly
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  return err('Operation failed');
}
```
