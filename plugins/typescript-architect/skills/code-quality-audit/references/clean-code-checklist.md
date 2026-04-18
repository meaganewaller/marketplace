# Clean Code Checklist for TypeScript

## Naming

- [ ] **Functions describe actions**: `calculateTotal`, `validateEmail`, `fetchUsers`
- [ ] **Booleans read as questions**: `isActive`, `hasPermission`, `canEdit`
- [ ] **Variables describe content**: `userCount` not `n`, `maxRetries` not `max`
- [ ] **No abbreviations**: `button` not `btn`, `message` not `msg` (unless domain standard)
- [ ] **Consistent vocabulary**: Don't mix `get`/`fetch`/`retrieve` — pick one per codebase
- [ ] **Types are nouns**: `User`, `OrderStatus`, `PaymentResult`
- [ ] **Generics are meaningful**: `TItem` not `T` when context helps, `T` is fine for truly generic utilities

## Functions

- [ ] **Do one thing**: Can you describe it without "and"?
- [ ] **≤ 3 parameters**: Use an options object for more
- [ ] **No side effects in name**: `getUser` should not also log or emit events
- [ ] **Return early**: Guard clauses at the top, happy path at the bottom
- [ ] **No flag arguments**: `createUser(data, true)` — what does `true` mean? Use separate functions or options

```typescript
// BAD: Flag argument
function findUsers(includeInactive: boolean) { /* ... */ }

// GOOD: Explicit intent
function findActiveUsers() { /* ... */ }
function findAllUsers() { /* ... */ }

// OR: Options object
function findUsers(options: { includeInactive?: boolean } = {}) { /* ... */ }
```

## Comments

- [ ] **Code explains "what"**: Comments explain "why"
- [ ] **No commented-out code**: Version control remembers
- [ ] **No obvious comments**: `// increment counter` above `counter++`
- [ ] **TODO has context**: `// TODO(#123): Migrate to Bun.sql when upgrading to v1.2`

## Error Handling

- [ ] **Never swallow errors**: Always log or propagate
- [ ] **Specific catch**: Catch specific error types, not `catch (e) {}`
- [ ] **Error messages are actionable**: "User not found: abc-123" not "Error occurred"
- [ ] **Validate at boundaries**: Parse external data at system edges, trust internal data

## File Organization

- [ ] **One concept per file**: Don't mix unrelated classes/functions
- [ ] **Imports ordered**: External → internal → relative
- [ ] **Exports are intentional**: Don't export everything — unexported = private
- [ ] **No circular imports**: A imports B imports A → restructure

## TypeScript-Specific

- [ ] **No `any`**: Use `unknown` and narrow, or define proper types
- [ ] **Minimal type assertions**: Each `as` is a potential runtime bug
- [ ] **Readonly by default**: Use `readonly` for properties that shouldn't change
- [ ] **Discriminated unions for state**: Not boolean flags
- [ ] **`satisfies` over `as const`**: When you need both type checking and inference
