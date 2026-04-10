# Shell Scripting with Bun

Bun provides `Bun.$` for shell scripting - a tagged template literal for running commands.

## Basic Usage

```typescript
import { $ } from "bun";

// Simple command
await $`echo "Hello, World!"`;

// Capture output
const result = await $`ls -la`.text();

// Get as lines
const files = await $`ls`.lines();

// Get as JSON
const pkg = await $`cat package.json`.json();
```

## Variable Interpolation

```typescript
const name = "file.txt";
const dir = "/tmp";

// Safe interpolation (auto-escaped)
await $`touch ${dir}/${name}`;

// Array expansion
const files = ["a.txt", "b.txt"];
await $`rm ${files}`;
```

## Output Handling

```typescript
// Get stdout as text
const text = await $`echo hello`.text();

// Get stdout as Buffer
const buffer = await $`cat image.png`.arrayBuffer();

// Get stdout as Blob
const blob = await $`cat file`.blob();

// Stream stdout
const proc = $`long-running-command`;
for await (const chunk of proc.stdout) {
  console.log(chunk);
}
```

## Error Handling

```typescript
// Throws on non-zero exit
try {
  await $`exit 1`;
} catch (err) {
  console.error(err.exitCode); // 1
  console.error(err.stderr);
}

// Don't throw on error
const result = await $`exit 1`.nothrow();
console.log(result.exitCode); // 1

// Check exit code
const { exitCode } = await $`test -f file.txt`.nothrow();
if (exitCode === 0) {
  console.log("File exists");
}
```

## Environment Variables

```typescript
// Set env for command
await $`echo $MY_VAR`.env({ MY_VAR: "value" });

// Use current env
await $`printenv`;

// Extend current env
await $`printenv`.env({ ...process.env, EXTRA: "value" });
```

## Working Directory

```typescript
// Run in specific directory
await $`ls`.cwd("/tmp");

// Chain with other options
await $`npm install`.cwd("./packages/app").quiet();
```

## Piping

```typescript
// Pipe between commands
await $`cat file.txt | grep pattern | wc -l`;

// Pipe to file
await $`echo "content" > output.txt`;

// Append to file
await $`echo "more" >> output.txt`;
```

## Quiet Mode

```typescript
// Suppress stdout/stderr printing
await $`npm install`.quiet();

// Still capture output
const output = await $`npm install`.quiet().text();
```

## Practical Examples

### Git Operations

```typescript
const branch = await $`git branch --show-current`.text();
const status = await $`git status --porcelain`.lines();
const hasChanges = status.length > 0;
```

### File Operations

```typescript
// Check if file exists
const exists = (await $`test -f ${path}`.nothrow()).exitCode === 0;

// Create directory
await $`mkdir -p ${dir}`;

// Copy with progress
await $`rsync -ah --progress ${src} ${dst}`;
```

### Process Management

```typescript
// Run in background
const proc = Bun.spawn(["long-task"], {
  stdout: "inherit",
  stderr: "inherit",
});

// Wait for completion
await proc.exited;
```

## Comparison with Alternatives

| Feature | Bun.$ | execa | child_process |
| --------- | ------- | ------- | --------------- |
| Template literals | Yes | No | No |
| Auto-escaping | Yes | Manual | Manual |
| TypeScript | Native | Yes | Yes |
| Streaming | Yes | Yes | Yes |
| Performance | Fast | Good | Good |
