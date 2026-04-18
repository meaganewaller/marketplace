# React Component Patterns

## Compound Components

For components that work together as a group (tabs, accordions, forms).

```typescript
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab components must be used within <Tabs>');
  return context;
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function TabTrigger({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}>
      {children}
    </button>
  );
}

function TabContent({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

// Usage
<Tabs defaultTab="profile">
  <Tabs.Trigger id="profile">Profile</Tabs.Trigger>
  <Tabs.Trigger id="settings">Settings</Tabs.Trigger>
  <Tabs.Content id="profile"><ProfileForm /></Tabs.Content>
  <Tabs.Content id="settings"><SettingsForm /></Tabs.Content>
</Tabs>
```

## Render Props (When Needed)

Use when a component needs to control what's rendered but the parent owns the shape.

```typescript
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  keyExtractor: (item: T) => string;
}

function DataList<T>({ items, renderItem, renderEmpty, keyExtractor }: DataListProps<T>) {
  if (items.length === 0) return renderEmpty?.() ?? <p>No items</p>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}
```

## Controlled vs Uncontrolled

```typescript
// Support both patterns with optional controlled props
interface InputProps {
  value?: string;            // Controlled mode
  defaultValue?: string;     // Uncontrolled mode
  onChange?: (value: string) => void;
}

function Input({ value: controlledValue, defaultValue = '', onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return <input value={currentValue} onChange={handleChange} />;
}
```

## Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Usage: wrap each widget independently so one failure doesn't crash all
<ErrorBoundary fallback={<WidgetError />}>
  <MetricsWidget />
</ErrorBoundary>
```

## Polymorphic Components

```typescript
type PolymorphicProps<E extends React.ElementType, P = {}> = P & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof P | 'as'>;

function Box<E extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<E, { children: ReactNode }>) {
  const Component = as ?? 'div';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Box>Default div</Box>
<Box as="section">A section</Box>
<Box as="a" href="/about">A link</Box>
```
