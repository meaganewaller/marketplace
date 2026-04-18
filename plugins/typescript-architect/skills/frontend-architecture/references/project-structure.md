# Frontend Project Structure

## Recommended Layout for Bun + React

```text
src/
├── app.tsx                  # Root component, router setup
├── pages/                   # Page-level components (one per route)
│   ├── index.html           # Entry HTML (Bun HTML import)
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
├── components/              # Shared, reusable components
│   ├── ui/                  # Generic UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   └── domain/              # Business-domain components
│       ├── UserCard.tsx
│       ├── OrderTable.tsx
│       └── ProductGrid.tsx
├── hooks/                   # Shared custom hooks
│   ├── useApi.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── types/                   # Shared TypeScript types
│   ├── api.ts               # API response types
│   ├── domain.ts            # Domain entity types
│   └── ui.ts                # UI-specific types
├── utils/                   # Pure utility functions
│   ├── format.ts
│   └── validation.ts
└── styles/
    ├── global.css
    └── variables.css
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useApi.ts` |
| Utilities | camelCase | `format.ts` |
| Types | PascalCase | `User`, `OrderStatus` |
| CSS files | kebab-case | `global.css` |
| Test files | Same name + `.test` | `UserCard.test.tsx` |

## Colocation Rules

1. **Component-specific types**: Define in the component file, not in `types/`
2. **Component-specific hooks**: Keep in the component file until reused
3. **Component tests**: Same directory as the component (`UserCard.test.tsx` next to `UserCard.tsx`)
4. **Shared types**: Move to `types/` only when used by 3+ files
5. **Shared hooks**: Move to `hooks/` only when used by 2+ components

## Barrel Exports (Use Sparingly)

```typescript
// components/ui/index.ts — OK for a small, stable set
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
```

Avoid barrel files for:

- Large directories (slows bundling)
- Directories that change frequently
- Deep nesting (barrel of barrels)

## Feature-Based Organization (For Larger Apps)

When the app grows beyond 10+ pages, organize by feature:

```text
src/
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── useAuth.ts
│   │   ├── auth.types.ts
│   │   └── auth.test.ts
│   ├── orders/
│   │   ├── OrderList.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── useOrders.ts
│   │   └── orders.types.ts
│   └── settings/
│       ├── SettingsPage.tsx
│       └── useSettings.ts
├── shared/                  # Cross-feature shared code
│   ├── components/
│   ├── hooks/
│   └── types/
└── app.tsx
```
