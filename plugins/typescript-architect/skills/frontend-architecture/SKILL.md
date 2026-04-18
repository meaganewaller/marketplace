---
name: frontend-architecture
description: Design frontend architecture for React/TypeScript applications served by Bun. Use when structuring components, managing state, designing component APIs, or organizing frontend code.
---

# Frontend Architecture for Bun + React + TypeScript

Guidance for building maintainable frontend applications with React, TypeScript, and Bun's HTML imports.

## When to Use This Skill

Use this skill when:

- Structuring a React component hierarchy
- Designing component APIs (props interfaces)
- Choosing state management approach
- Organizing frontend modules and directories
- Building forms, data tables, or complex UI
- Setting up Bun's HTML import-based frontend

## Core Architecture Principles

1. **Components are functions**: Prefer function components exclusively
2. **Props down, events up**: Unidirectional data flow always
3. **Colocation**: Keep related code together (styles, tests, types)
4. **Composition over configuration**: Build complex UI from simple, composable pieces
5. **Server-first**: Push logic to the Bun server; keep client lean

## Bun Frontend Setup

```typescript
// server.ts
import homepage from "./pages/index.html";
import dashboard from "./pages/dashboard.html";

Bun.serve({
  routes: {
    "/": homepage,
    "/dashboard": dashboard,
    "/api/data": {
      GET: async () => Response.json(await fetchData()),
    },
  },
  development: { hmr: true, console: true },
});
```

```html
<!-- pages/index.html -->
<html>
<head>
  <link rel="stylesheet" href="../styles/global.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="../src/app.tsx"></script>
</body>
</html>
```

## Component Design Rules

### Component Size

- **< 50 lines**: Ideal — easy to read and test
- **50-100 lines**: Acceptable for complex components
- **> 100 lines**: Split into sub-components

### Props Interface Design

```typescript
// GOOD: Specific, minimal props
interface UserCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  onEdit: () => void;
}

// BAD: Passing entire objects when only fields are needed
interface UserCardProps {
  user: User; // Component now coupled to User shape
  onEdit: (user: User) => void;
}

// EXCEPTION: When the component genuinely operates on the whole entity
interface UserProfileProps {
  user: User; // Profile displays all user fields — this is appropriate
}
```

## Progressive Disclosure

For detailed patterns:

- **Component patterns** → Read `references/component-patterns.md`
- **State management** → Read `references/state-management.md`
- **Project structure** → Read `references/project-structure.md`

## Key Decisions

### When to Extract a Component

Extract when:

- A piece of UI is used in 2+ places
- A section has its own state that doesn't affect siblings
- The parent component exceeds 100 lines
- You can name the component with a domain concept

Don't extract when:

- It's only used once AND is simple
- Extraction would require passing 5+ props down
- The "component" is just a styled wrapper with no logic

### Custom Hooks

Extract a custom hook when:

- The same stateful logic appears in 2+ components
- A component's hook calls are complex enough to obscure the render logic
- The logic is independently testable

```typescript
// Good custom hook: encapsulates fetch + loading + error
function useApi<T>(url: string): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

<example>
user: How should I structure components for a dashboard with multiple widgets?
assistant: I'll use the frontend-architecture skill for this.

**Recommended structure:**

```text
src/
├── app.tsx              # Root with layout
├── components/
│   ├── layout/
│   │   ├── Dashboard.tsx    # Grid layout, no business logic
│   │   └── Sidebar.tsx
│   └── widgets/
│       ├── MetricsWidget.tsx
│       ├── ChartWidget.tsx
│       └── ActivityWidget.tsx
├── hooks/
│   └── useMetrics.ts    # Shared data fetching
└── types/
    └── dashboard.ts     # Shared type definitions
```

**Key decisions:**

1. Dashboard component owns the layout grid — widgets don't know their position
2. Each widget fetches its own data via hooks — no prop drilling from Dashboard
3. Widget components are pure: `(props) => JSX` with hooks for side effects
</example>
