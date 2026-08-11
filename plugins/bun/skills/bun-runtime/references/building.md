# Bundling and Standalone Executables

`bun build` is Bun's bundler. It replaces webpack/esbuild for most projects and can emit a single-file native executable. Verified against Bun 1.3.14.

## Bundling

```bash
bun build ./src/index.ts --outfile=dist/index.js
bun build ./src/index.ts --outdir=dist --target=bun
bun build ./src/index.ts --outdir=dist --production   # NODE_ENV=production + minify
```

Key flags:

| Flag | Purpose |
| ------ | --------- |
| `--target=bun\|node\|browser` | Execution environment; picks export conditions and built-in handling |
| `--format=esm\|cjs\|iife` | Module format; defaults to `esm` |
| `--minify` | All minification (or `--minify-syntax`, `--minify-whitespace`, `--minify-identifiers`) |
| `--sourcemap=linked\|inline\|external\|none` | Source maps |
| `--splitting` | Shared chunks across entry points |
| `--packages=external` | Keep `node_modules` out of the bundle (libraries) |
| `-e, --external=<pkg>` | Exclude specific packages; supports `*` wildcards |
| `--env=inline\|disable\|<PREFIX>_*` | Inline env vars into the bundle |
| `--keep-names` | Preserve function/class names through minification |
| `--banner` / `--footer` | Prepend/append text, e.g. `"use client"` |

Bundle a library without vendoring its dependencies:

```bash
bun build ./src/index.ts --outdir=dist --target=node --packages=external --sourcemap=external
```

Inline only public env vars for a browser bundle — never inline everything:

```bash
bun build ./src/app.tsx --outdir=dist --target=browser --env='PUBLIC_*'
```

## Standalone Executables

`--compile` bundles the code together with the Bun runtime into one native binary that runs on machines without Bun installed. It implies `--production`.

```bash
bun build ./cli.ts --compile --outfile=myapp
./myapp
```

Verified: produces a Mach-O/ELF/PE native executable with no runtime dependency on an installed Bun.

### Cross-compilation

```bash
bun build ./cli.ts --compile --target=bun-linux-x64   --outfile=dist/myapp-linux
bun build ./cli.ts --compile --target=bun-darwin-arm64 --outfile=dist/myapp-macos
bun build ./cli.ts --compile --target=bun-windows-x64  --outfile=dist/myapp.exe
```

Target names follow `bun-<os>-<arch>`, where os is `linux`, `darwin`, or `windows` and arch is `x64` or `arm64`. Suffixes `-musl` (Alpine) and `-baseline` (pre-AVX2 CPUs) are also available. An unrecognized value fails fast with `InvalidTarget`.

Cross-compiling downloads the target platform's Bun binary on first use. In CI, cache it or pass `--compile-executable-path` to supply one.

### Runtime autoloading in compiled binaries

Compiled executables control what they read from disk at runtime:

| Flag | Default |
| ------ | --------- |
| `--compile-autoload-dotenv` | on — reads `.env` next to the binary |
| `--compile-autoload-bunfig` | on |
| `--compile-autoload-tsconfig` | off |
| `--compile-autoload-package-json` | off |

For a binary that must behave identically everywhere, disable dotenv autoloading so a stray `.env` cannot change its behavior:

```bash
bun build ./cli.ts --compile --no-compile-autoload-dotenv --outfile=myapp
```

### Windows metadata

```bash
bun build ./cli.ts --compile --target=bun-windows-x64 \
  --windows-icon=./icon.ico --windows-title="My CLI" --windows-hide-console \
  --outfile=dist/myapp.exe
```

### Faster startup

```bash
bun build ./cli.ts --compile --bytecode --outfile=myapp
```

`--bytecode` embeds a bytecode cache, trading binary size for startup time. It defaults the format to `cjs`.

## Analyzing a Bundle

```bash
bun build ./src/index.ts --outdir=dist --metafile=meta.json
bun build ./src/index.ts --outdir=dist --metafile-md=graph.md
```

`--metafile-md` writes a markdown visualization of the module graph, which is far easier to read — and to hand to a language model — than the JSON form. Use it when tracking down why a bundle grew.

## Catching Unresolved Imports

By default Bun allows dynamic `import()` specifiers it cannot resolve at build time. To fail the build instead:

```bash
bun build ./src/index.ts --outdir=dist --reject-unresolved
```

Worth enabling in CI for applications; leave it off for libraries that intentionally use optional dynamic imports.

## JavaScript API

```typescript
const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  minify: true,
  sourcemap: "external",
});
console.log(result.outputs.map((o) => o.path));
```

`Bun.build` **throws** on a failed build — an `AggregateError` holding the individual errors. It does not resolve with `success: false` unless asked:

```typescript
const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  throw: false,          // opt back into the non-throwing result shape
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
```

Checking `result.success` without passing `throw: false` is dead code — the throw happens first. Older guidance that omits `throw: false` predates this behavior.

## Common Mistakes

| Mistake | Correction |
| --------- | ------------ |
| Adding webpack/esbuild/tsup | `bun build` covers these cases |
| Bundling deps into a published library | `--packages=external` |
| `--env=inline` for a browser bundle | Leaks secrets; scope with a `PUBLIC_*` prefix |
| Expecting `--compile` to need Bun on the target | The runtime is embedded |
| Checking `result.success` without `throw: false` | `Bun.build` throws first; the check never runs |
| Guessing compile target names | `bun-<os>-<arch>`; wrong values raise `InvalidTarget` |
