# State Management Patterns

## Decision Framework

| Scope | Solution | When |
|-------|----------|------|
| Single component | `useState` | Local UI state (toggles, form fields) |
| Parent-child (2-3 levels) | Props | Simple data passing |
| Subtree (3+ levels) | `useContext` + `useReducer` | Theme, auth, feature-scoped state |
| Complex domain state | `useReducer` | State machines, multi-field forms |
| Server data | `fetch` + custom hook | API data with loading/error states |
| URL state | URL search params | Filters, pagination, sort that should be shareable |

## useReducer for Complex State

```typescript
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

interface FormState {
  fields: Record<string, string>;
  errors: Record<string, string>;
  status: 'idle' | 'submitting' | 'success' | 'error';
  submitError: string | null;
}

const initialState: FormState = {
  fields: {},
  errors: {},
  status: 'idle',
  submitError: null,
};

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        fields: { ...state.fields, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SUBMIT_START':
      return { ...state, status: 'submitting', submitError: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'success' };
    case 'SUBMIT_ERROR':
      return { ...state, status: 'error', submitError: action.error };
    case 'RESET':
      return initialState;
  }
}
```

## Context Pattern (Scoped Providers)

```typescript
// Create a scoped context with hook
function createScopedContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function useContextValue(): T {
    const value = useContext(Context);
    if (!value) throw new Error(`use${name} must be used within ${name}Provider`);
    return value;
  }

  return [Context.Provider, useContextValue] as const;
}

// Usage
interface AuthContext {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const [AuthProvider, useAuth] = createScopedContext<AuthContext>('Auth');

function AuthProviderComponent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const auth: AuthContext = {
    user,
    login: async (creds) => { /* ... */ },
    logout: () => setUser(null),
  };

  return <AuthProvider value={auth}>{children}</AuthProvider>;
}
```

## Server State Pattern

```typescript
function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { refetchInterval?: number } = {},
): { data: T | undefined; error: Error | null; isLoading: boolean; refetch: () => void } {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setData(await fetcher());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchData();
    if (options.refetchInterval) {
      const id = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(id);
    }
  }, [fetchData, options.refetchInterval]);

  return { data, error, isLoading, refetch: fetchData };
}

// Usage
function UserList() {
  const { data: users, isLoading, error } = useQuery('users', () =>
    fetch('/api/users').then(r => r.json()),
  );

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

## Anti-Patterns to Avoid

1. **Global state for local concerns**: Don't put modal open/close in global state
2. **Derived state in useState**: If it can be computed from other state, compute it
3. **State synchronization**: Two sources of truth that you try to keep in sync — use one source
4. **Over-abstraction**: Don't build a state management framework — use the platform
