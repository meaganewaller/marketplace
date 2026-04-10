# my marketplace

these are my plugins. you may like them?

## install

add this marketplace

```txt
# From GitHub
/plugin marketplace add meaganewaller/marketplace
```

## available plugins

### decision-journal

[Plugin README](plugins/decision-journal/README.md)

**Category:** utility

Captures tradeoffs and related decisions into markdown automatically.

**Contains:**

- **Hooks:**
  - PostToolUse (Write|Edit): Creates markers for large changes
  - PreCompact (auto): Triggers capture agent before compaction
  - Stop: Cleans up old markers
- **Agents:**
  - `capture-decisions`: Analyzes context and writes rich journal entries

**Installation:**

```bash
/plugin install decision-journal@meaganewaller-marketplace
```

---

> **Note:** The `example-plugin` in `plugins/example-plugin/` is a template for creating new plugins and is not published to the marketplace.

## development

this is a monorepo with multiple plugins. each plugin is a separate npm package in the `plugins/` directory.

### quick start

clone this repo and run the following commands to get started:

```bash
# install bun via mise
mise install

# install deps, run prepare scripts
bun install

# run tests for all plugins
bun test
```
