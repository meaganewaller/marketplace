# Shell Scripting with `Bun.$`

`Bun.$` runs shell commands from a tagged template. It uses Bun's own cross-platform shell — the same script works on Windows without a POSIX shell installed. Verified against Bun 1.3.14.

## Basics

```typescript
import { $ } from "bun";

await $`echo "Hello"`;                    // runs, streams output to stdout
const text = await $`git status`.text();  // capture stdout
const pkg  = await $`cat package.json`.json();
const rows = await Array.fromAsync($`ls`.lines());
```

Output methods: `.text()`, `.json()`, `.lines()`, `.blob()`, `.arrayBuffer()`, `.bytes()`. `.lines()` is an async iterable, so consume it with `for await` or `Array.fromAsync`.

## Interpolation Is Escaped

Interpolated values are passed as single arguments, never re-parsed as shell syntax. Verified: interpolating `a b; touch /tmp/PWNED` created a file with that literal name and did **not** execute the `touch`.

```typescript
const userInput = "a b; rm -rf /";
await $`touch ${userInput}`;      // one file, literally named "a b; rm -rf /"
```

This makes `Bun.$` injection-safe by default and is the main reason to prefer it over `child_process.exec` with a built string. Arrays expand to separate arguments:

```typescript
const files = ["a.txt", "b.txt"];
await $`rm ${files}`;             // rm a.txt b.txt
```

To interpolate raw shell syntax on purpose, opt out explicitly with `$.raw`.

## Error Handling

A non-zero exit throws a `ShellError`:

```typescript
try {
  await $`exit 1`;
} catch (err) {           // ShellError
  console.error(err.exitCode, err.stderr.toString());
}
```

Use `.nothrow()` when a non-zero exit is an expected outcome:

```typescript
const { exitCode } = await $`git diff --quiet`.nothrow();
const hasChanges = exitCode !== 0;
```

`err.stdout` and `err.stderr` are Buffers — call `.toString()` before logging them.

## Options

```typescript
await $`npm install`.quiet();                    // suppress passthrough output
await $`pwd`.cwd("/tmp");                        // working directory
await $`echo $FOO`.env({ FOO: "bar" });          // replaces the environment
await $`printenv`.env({ ...process.env, X: "1" }); // extend instead of replace
```

`.env()` **replaces** the environment rather than extending it. Spread `process.env` when the command still needs `PATH` and friends.

`.quiet()` suppresses streaming to the terminal but still captures output, so `.quiet().text()` is the usual pairing for scripts that parse results.

## Redirection and Pipes

```typescript
await $`cat a.txt | sort -u | wc -l`;
await $`echo "content" > out.txt`;
await $`echo "more" >> out.txt`;
await $`cmd 2>&1`;

// redirect to and from JavaScript values
const buf = Buffer.alloc(1024);
await $`cat file.txt > ${buf}`;
await $`cat < ${new Response("data")}`;
```

## Built-in Commands

Bun's shell implements `cd`, `ls`, `rm`, `echo`, `pwd`, `cat`, `touch`, `mkdir`, `which`, `mv`, `cp`, and others internally, so scripts behave consistently across platforms rather than depending on system coreutils.

## When to Use `Bun.spawn` Instead

`Bun.$` is for short commands whose output is consumed at the end. Use `Bun.spawn` for long-running processes, incremental streaming, or fine-grained stdio control:

```typescript
const proc = Bun.spawn(["./server", "--port", "3000"], {
  stdout: "pipe",
  stderr: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

for await (const chunk of proc.stdout) {
  process.stdout.write(chunk);          // stream as it arrives
}

const code = await proc.exited;
proc.kill();
```

`proc.stdout` is a `ReadableStream` when `stdout: "pipe"`; read it all at once with `new Response(proc.stdout).text()`. A `ShellPromise` from `$` does not expose a `.stdout` stream — that distinction is a common mix-up.

`Bun.spawnSync` covers the blocking case.

## A Real Script

```typescript
#!/usr/bin/env bun
import { $ } from "bun";

const branch = (await $`git branch --show-current`.text()).trim();
if (branch === "main") {
  console.error("refusing to run on main");
  process.exit(1);
}

const dirty = (await $`git status --porcelain`.text()).trim().length > 0;
if (dirty) {
  console.error("working tree is dirty");
  process.exit(1);
}

await $`bun test`;                        // throws and aborts if tests fail
await $`bun build ./src/index.ts --outdir=dist`.quiet();
console.log(`built ${branch}`);
```

Make it executable with `chmod +x` and run it directly — the shebang handles the rest.

## Common Mistakes

| Mistake | Correction |
| --------- | ------------ |
| Building a command string and interpolating it | Interpolate values; `$` escapes them |
| Expecting `.env()` to extend the environment | It replaces; spread `process.env` |
| Logging `err.stderr` directly | It is a Buffer — `.toString()` |
| Treating a non-zero exit as a return value | It throws; use `.nothrow()` |
| Iterating `$\`cmd\`.stdout` | Not a stream — use `.lines()` or `Bun.spawn` |
| Using `$` for a long-running server | Use `Bun.spawn` |
| Adding execa or zx | `Bun.$` covers both |
