# Built-in APIs

Bun ships functionality that would otherwise require dependencies. Examples verified against Bun 1.3.14.

| Need | Use | Instead of |
| ------ | ----- | ------------ |
| HTTP server | `Bun.serve` | express, fastify |
| File I/O | `Bun.file`, `Bun.write` | `node:fs` |
| Shell | `Bun.$` | execa, zx |
| SQLite | `bun:sqlite` | better-sqlite3 |
| Postgres | `Bun.sql` | pg, postgres.js |
| Redis | `Bun.redis` | ioredis |
| WebSocket client | global `WebSocket` | ws |
| Globbing | `Bun.Glob` | glob, fast-glob |
| Password hashing | `Bun.password` | bcrypt, argon2 |

## `Bun.serve`

`routes` is a real router — match patterns, per-method handlers, and path parameters. `fetch` is only the fallback for unmatched requests.

```typescript
const server = Bun.serve({
  port: 3000,
  routes: {
    "/health": new Response("ok"),                       // static, no handler call
    "/users/:id": (req) => Response.json({ id: req.params.id }),
    "/api/items": {
      GET: () => Response.json(items),
      POST: async (req) => Response.json(await req.json(), { status: 201 }),
    },
  },
  fetch: () => new Response("Not found", { status: 404 }),
});

console.log(`listening on ${server.url}`);
```

A static `Response` value is served without invoking a handler. Path parameters land on `req.params` as strings. Use `port: 0` to bind an ephemeral port — the pattern for tests — and read the assigned port from `server.port`.

### WebSockets

```typescript
Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req, { data: { userId: "123" } })) return;
    return new Response("Expected a websocket", { status: 426 });
  },
  websocket: {
    open(ws) { ws.subscribe("room"); },
    message(ws, msg) { ws.publish("room", msg); },
    close(ws) { ws.unsubscribe("room"); },
  },
});
```

`server.upgrade()` returns `true` when the upgrade succeeded — return immediately without a `Response`. Built-in pub/sub via `subscribe`/`publish` removes the need for a separate broadcast layer.

## `Bun.file` and `Bun.write`

`Bun.file` is lazy: it describes a file without reading it.

```typescript
const f = Bun.file("data.json");
if (await f.exists()) {
  const data = await f.json();          // also .text(), .bytes(), .arrayBuffer(), .stream()
  console.log(f.size, f.type);
}

await Bun.write("out.json", JSON.stringify(data));
await Bun.write("copy.bin", Bun.file("src.bin"));   // file-to-file, no buffering
await Bun.write("page.html", await fetch(url));     // response straight to disk
```

`Bun.write` accepts strings, buffers, `Blob`s, `Response`s, and other `Bun.file`s, and creates the file if absent.

## `bun:sqlite`

```typescript
import { Database } from "bun:sqlite";

const db = new Database("app.sqlite", { create: true, strict: true });
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");

const insert = db.query("INSERT INTO users (name) VALUES (?)");
insert.run("Ada");

const byName = db.query("SELECT * FROM users WHERE name = ?");
byName.get("Ada");    // first row or null
byName.all("Ada");    // all rows

const tx = db.transaction((names: string[]) => {
  for (const n of names) insert.run(n);
});
tx(["Grace", "Alan"]);      // wrapped in a single transaction
```

Prepare statements once and reuse them. Use `:memory:` for tests. `db.transaction()` returns a callable that commits on return and rolls back if the body throws.

## `Bun.sql` (Postgres)

```typescript
import { sql } from "bun";

const users = await sql`SELECT * FROM users WHERE id = ${id}`;
```

Interpolated values become bound parameters, not string concatenation — this is injection-safe by construction. Reads `POSTGRES_URL`/`DATABASE_URL` from the environment. Start the connection early with `bun --sql-preconnect`.

## `Bun.redis`

```typescript
import { redis } from "bun";

await redis.set("key", "value");
await redis.get("key");
await redis.incr("counter");
```

Uses `REDIS_URL`. `bun --redis-preconnect` connects at startup.

## `Bun.Glob`

```typescript
const glob = new Bun.Glob("**/*.test.ts");

for await (const path of glob.scan(".")) console.log(path);

const all = await Array.fromAsync(glob.scan({ cwd: "src", onlyFiles: true }));
glob.match("src/a.test.ts");    // boolean, no filesystem access
```

## `Bun.password`

```typescript
const hash = await Bun.password.hash(plaintext);           // argon2id by default
const ok = await Bun.password.verify(plaintext, hash);
```

The algorithm and parameters are encoded in the hash string, so `verify` needs no configuration. Use `{ algorithm: "bcrypt" }` only to interoperate with an existing bcrypt store.

## Smaller Utilities

```typescript
Bun.env.MY_VAR;                       // like process.env
Bun.sleep(1000);                      // promise-based delay
Bun.nanoseconds();                    // high-resolution timer
Bun.deepEquals(a, b);
Bun.escapeHTML(userInput);
Bun.randomUUIDv7();                   // time-ordered, index-friendly UUID
Bun.which("git");                     // resolve a binary on PATH
Bun.peek(promise);                    // read a settled promise without awaiting
Bun.inspect(value);                   // what console.log would print
```

## Common Mistakes

| Mistake | Correction |
| --------- | ------------ |
| Routing by hand inside `fetch` | Use `routes`; `fetch` is the fallback |
| Reading a file to copy it | `Bun.write(dest, Bun.file(src))` streams |
| Re-preparing SQL in a loop | Prepare once, reuse the statement |
| Building SQL with template concatenation | `Bun.sql` binds interpolations as parameters |
| Adding bcrypt | `Bun.password` defaults to argon2id |
| Hardcoding a test port | `port: 0`, then read `server.port` |
