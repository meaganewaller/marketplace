# sitegraph

Filesystem-as-navigation-graph static sites for technical reports, audits, and
dashboards — an auto-discovered, auto-fitting nav rail and sitemap kept in sync by a
zero-dependency rebuild script, styled by a single CDN-served CSS kernel. No JS
framework, no SSG, no build step.

Drop HTML files into directories. Run the `rebuild-nav` skill. The sitemap and every
page's nav rail, breadcrumb, and prev/next links rewrite themselves from the folder
structure — nothing to hand-maintain, nothing to configure per page.

Built for structured technical work meant to be linked forever: audits, commit/PR
digests, metrics dashboards, contractor showcases, telemetry views, weekly reports.
Not for blog posts, marketing pages, or interactive web apps.

## Installation

```bash
/plugin install sitegraph@meaganewaller-marketplace
```

## Components

### Skills

- **rebuild-nav**: walks a site root and (re)writes the generated `<head>` link, nav
  rail, breadcrumb, and prev/next footer inside every discovered HTML page, plus a
  full sitemap page at the site root. Idempotent — a file is only rewritten if its
  generated content actually changed.

### Commands

(None — invoke `rebuild-nav` directly; see [Usage](#usage).)

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## How It Works

- **The filesystem is the graph.** Every directory is a section, every
  `*.html`/`*.htm` file is a page. There's no separate config to declare structure.
- **`index.html` is a section's hub.** Its `<title>` (or first `<h1>`) becomes the
  section label in the rail and breadcrumb; without one, the section still appears
  but isn't itself a link.
- **Order follows filenames.** A numeric-prefix convention (`01-`, `02-`, …) sorts
  naturally — `2-` before `10-`, no zero-padding required. Prefixes of up to three
  digits are dropped from the displayed label; four-digit years are kept, so
  `2026-q1/` reads as "2026 Q1".
- **Everything generated lives inside marker comments** (`<!-- sitegraph:*:start
  -->` … `<!-- sitegraph:*:end -->`). Hand-authored content outside those markers is
  never touched, so pages can evolve for years without the tool fighting your edits.
- **Pages work opened directly via `file://`.** All internal links are relative,
  percent-encoded paths; the only network dependency is the CDN-served CSS kernel
  itself, loaded via a normal `<link>`, not fetched.
- **One shared CSS kernel, versioned.** `assets/kernel.css` ships from this plugin
  and is referenced by a jsdelivr URL pinned to this plugin's release tag by
  default, so a site's look doesn't drift out from under it later. See
  [rebuild-nav's authoring reference](skills/rebuild-nav/references/authoring.md)
  for the config override and the CSS helper classes (`badge`, `callout`, `metric`)
  available to page content.

## Usage

```bash
# from anywhere Claude Code can reach the plugin
bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" ./site

# dry run — reports drift, writes nothing, exits non-zero if anything is stale
bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" ./site --check
```

In a Claude Code session, just ask: *"I added some new report pages under
`site/reports/` — wire them into the nav"* or *"rebuild the sitemap"* — the
rebuild-nav skill picks it up. There's no separate init step: running it against a
new or empty directory bootstraps `sitegraph.config.json` and an initial
`sitemap.html`.

## Development

The rebuild script has regression tests that drive the real CLI against temporary
site fixtures — every case corresponds to a bug that shipped once:

```bash
bun test plugins/sitegraph
```

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
