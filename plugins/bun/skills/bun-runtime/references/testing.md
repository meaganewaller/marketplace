# Testing with `bun:test`

Bun has a built-in, Jest-compatible test runner. No dependencies needed. All flags verified against Bun 1.3.14.

## Test Discovery

Bun finds tests **by filename only**. A file is a test file when its name contains `.test.`, `_test_`, `.spec.`, or `_spec_` with a JS/TS extension.

There is no `include`/`exclude` configuration. `[test] include` and `[test] exclude` in `bunfig.toml` are silently ignored — setting them changes nothing. To control the set, rename files, pass path filters, or use `--path-ignore-patterns`.

```bash
bun test                        # every test file under the project
bun test src/utils              # only paths matching "src/utils"
bun test foo bar                # files matching "foo" or "bar"
bun test --path-ignore-patterns='**/fixtures/**'
```

## CLI Flags

```bash
bun test -t "parses headers"    # filter by test NAME (regex)
bun test --watch
bun test --bail                 # stop at first failure (--bail=3 for a count)
bun test --timeout 10000        # per-test timeout, default 5000ms
bun test --only                 # only test.only / describe.only
bun test --todo                 # include test.todo
bun test --coverage
bun test --changed              # only files affected by git changes
bun test --shard=1/3            # split across CI jobs
bun test --parallel             # worker processes, implies --isolate
bun test --isolate              # fresh global per file
bun test --retry=2              # retry flaky tests
bun test --randomize            # randomize order to expose inter-test coupling
bun test --reporter=junit --reporter-outfile=results.xml
bun test --only-failures        # hide passing tests
bun test --rerun-each=10        # run each file N times to surface flakiness
```

## Writing Tests

```typescript
import { describe, test, expect, beforeEach } from "bun:test";

describe("parseConfig", () => {
  let config: Config;
  beforeEach(() => {
    config = loadFixture();
  });

  test("defaults port to 3000 when unset", () => {
    expect(parseConfig(config).port).toBe(3000);
  });

  test("rejects a negative port", () => {
    expect(() => parseConfig({ ...config, port: -1 })).toThrow("invalid port");
  });
});
```

Lifecycle hooks: `beforeAll`, `afterAll`, `beforeEach`, `afterEach`. Hooks in a `describe` scope to that block; at file top level they scope to the file.

### Variants

```typescript
test.skip("not ready", () => {});
test.todo("write this");
test.only("focus", () => {});
test.failing("known bug", () => {});     // passes when the body throws
test.if(process.platform === "darwin")("mac only", () => {});
test.each([[1, 1, 2], [2, 2, 4]])("%i + %i = %i", (a, b, sum) => {
  expect(a + b).toBe(sum);
});
```

### Async and timeouts

```typescript
test("fetches the user", async () => {
  await expect(getUser(1)).resolves.toMatchObject({ id: 1 });
});

test("slow path", async () => {
  await migrate();
}, 30_000);                                // third arg = per-test timeout
```

## Assertions

```typescript
expect(v).toBe(x);                 // Object.is
expect(v).toEqual(x);              // deep, ignores undefined props
expect(v).toStrictEqual(x);        // deep, type- and undefined-sensitive
expect(v).toBeCloseTo(0.3, 5);
expect(s).toMatch(/re/);
expect(arr).toContainEqual(obj);   // deep equality within an array
expect(obj).toMatchObject({ a: 1 });
expect(fn).toThrow(TypeError);
await expect(p).rejects.toThrow("boom");
expect(mock).toHaveBeenCalledWith("arg");
expect(v).toBeOneOf([1, 2, 3]);
```

Prefer `toEqual`/`toMatchObject` over `toBe` for objects — `toBe` compares identity and fails on structurally equal values.

## Mocking

```typescript
import { mock, spyOn, jest } from "bun:test";

const fetchUser = mock(async (id: number) => ({ id, name: "Ada" }));
fetchUser.mockResolvedValueOnce({ id: 9, name: "Grace" });

await fetchUser(9);
expect(fetchUser).toHaveBeenCalledTimes(1);
expect(fetchUser).toHaveBeenCalledWith(9);

const spy = spyOn(console, "log").mockImplementation(() => {});
spy.mockRestore();                        // always restore spies on globals

jest.restoreAllMocks();                   // in afterEach, to prevent leakage
```

### Module mocks

```typescript
import { mock } from "bun:test";

mock.module("./mailer", () => ({
  send: mock(async () => ({ ok: true })),
}));
```

`mock.module` affects modules imported *after* the call. Register it before importing the code under test, ideally via `--preload`.

### Time

```typescript
import { setSystemTime } from "bun:test";

setSystemTime(new Date("2026-01-01T00:00:00Z"));
expect(new Date().getUTCFullYear()).toBe(2026);
setSystemTime();                          // restore real time
```

## Snapshots

```typescript
expect(render(props)).toMatchSnapshot();
expect(value).toMatchInlineSnapshot();    // written back into the file
```

```bash
bun test -u        # update snapshots (--update-snapshots)
```

## Coverage

```bash
bun test --coverage
bun test --coverage --coverage-reporter=lcov --coverage-dir=coverage
```

```toml
# bunfig.toml — these keys are real, unlike include/exclude
[test]
coverage = true
coverageThreshold = 0.9
coverageReporter = ["text", "lcov"]
coverageDir = "coverage"
coverageSkipTestFiles = true
```

`coverageThreshold` is enforced: when coverage falls below it, `bun test` exits non-zero even though every test passed.

The per-metric form takes **plural** keys:

```toml
coverageThreshold = { lines = 0.9, functions = 0.8, statements = 0.9 }
```

Singular keys (`line`, `function`, `statement`) are accepted by the TOML parser and then silently ignored — the gate passes no matter how low coverage is. Verified in 1.3.14: at 33% line coverage, `{ lines = 0.99 }` exits 1 while `{ line = 0.99 }` exits 0. A nested `[test.coverageThreshold]` table is likewise ignored.

After configuring a threshold, confirm it actually fails:

```bash
bun test --coverage; echo "exit=$?"    # must be non-zero when under threshold
```

## Preloading

```toml
[test]
preload = ["./test/setup.ts"]
```

Use preload for global setup: registering module mocks, seeding a test database, installing custom matchers via `expect.extend`.

## CI

```yaml
- run: bun install --frozen-lockfile
- run: bun test --coverage --reporter=junit --reporter-outfile=junit.xml
```

Split a slow suite across jobs with a matrix and `--shard=${{ matrix.shard }}/4`.

## Common Mistakes

| Mistake | Correction |
| --------- | ------------ |
| `--grep` to filter by name | `-t` / `--test-name-pattern` |
| Configuring `[test] include`/`exclude` | Ignored — rename files or filter by path |
| Naming a file `foo.check.ts` and expecting it to run | Needs `.test.`, `_test_`, `.spec.`, or `_spec_` |
| Spying on a global without restoring | `mockRestore()` or `jest.restoreAllMocks()` in `afterEach` |
| `mock.module` after importing the subject | Register it first, or via `preload` |
| Assuming coverage thresholds only warn | They fail the run |
| `coverageThreshold = { line = ... }` | Plural keys — singular is silently ignored |
| Chasing order-dependent failures by hand | `--randomize` and `--rerun-each` surface them |
