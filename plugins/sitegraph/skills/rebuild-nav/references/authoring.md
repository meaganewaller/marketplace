# Authoring sitegraph Pages

Reference for writing pages that sitegraph's `rebuild-nav` script will discover and
wire up correctly. Read [SKILL.md](../SKILL.md) first for when/how to run the script.

## Minimal Page Skeleton

A page needs nothing beyond valid `<head>`/`<body>` tags — no markers, no classes, no
front matter:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Q1 Security Audit</title>
</head>
<body>
  <h1>Q1 Security Audit</h1>
  <p>Findings go here.</p>
</body>
</html>
```

Drop this anywhere under the site root and run rebuild-nav. It will inject the CSS
`<link>`, the nav rail, a breadcrumb, and a prev/next footer around your content —
your `<h1>` and everything else stay exactly as written.

## The Marker Contract

The script owns everything between these comment pairs and overwrites it on every
run:

```html
<!-- sitegraph:head:start -->...<!-- sitegraph:head:end -->
<!-- sitegraph:nav:start -->...<!-- sitegraph:nav:end -->
<!-- sitegraph:footer:start -->...<!-- sitegraph:footer:end -->
```

Never hand-edit inside them — changes are silently discarded on the next rebuild (run
with `--check` to catch this before it happens). Everything outside the markers is
yours; the script never touches it. `sitemap.html` at the site root is a special
case: the *entire file* is generated, not just marker blocks — don't hand-edit it at
all.

If a page is missing a `<head>` or `<body>` tag entirely, the corresponding block is
skipped with a warning rather than guessed at. Add the missing tag and rerun.

## How Titles and Order Are Derived

| Concern | Rule |
|---|---|
| Page title | `<title>` text → first `<h1>` text → humanized filename (first match wins) |
| Section title | Its `index.html`'s title, if one exists, else humanized directory name |
| Sort order | Natural (numeric-aware) sort of the raw file/directory name — `2-` sorts before `10-` without zero-padding |
| Acronyms | Preserved only if already capitalized in the filename: `API-audit.html` → "API Audit"; `api-audit.html` → "Api Audit" |

Title extraction is regex-based against well-formed `<title>`/`<h1>` tags (plain
text, no nested markup) — good enough for hand-authored pages, not a full HTML
parser.

## `sitegraph.config.json`

Written with defaults the first time rebuild-nav runs against a site root that
doesn't have one yet. All fields are optional overrides:

```json
{
  "title": "Platform Reliability",
  "cssUrl": null,
  "sitemapFile": "sitemap.html",
  "sitemapTitle": "Sitemap",
  "ignore": [".git", ".claude", "node_modules", ".DS_Store"]
}
```

- `title` — site name shown at the top of the nav rail and in the sitemap `<title>`.
  Defaults to the humanized site-root directory name.
- `cssUrl` — override for the CSS kernel `<link>` href. Leave `null` to use the
  default, which is pinned to this plugin's release tag on jsdelivr (see
  [CSS Kernel](#css-kernel) below) — set this if you want to vendor the CSS locally,
  point at a fork, or track `@main` instead of a pinned tag.
- `sitemapFile` / `sitemapTitle` — rename the generated sitemap page.
- `ignore` — directory/file **names** (not paths or globs) to skip anywhere in the
  tree.

## CSS Kernel

Every page links a single shared stylesheet instead of duplicating CSS — see
[`assets/kernel.css`](../../../assets/kernel.css) for the full source. The default
`cssUrl` points at a version-pinned jsdelivr URL
(`.../marketplace@sitegraph-vX.Y.Z/plugins/sitegraph/assets/kernel.css`) derived from
this plugin's own `plugin.json` version, so a site's styling doesn't shift under it
years later just because the kernel evolved upstream. If this plugin hasn't been
released yet (no matching `sitegraph-vX.Y.Z` git tag exists), override `cssUrl` to
track `@main` until it has:

```json
{ "cssUrl": "https://cdn.jsdelivr.net/gh/meaganewaller/marketplace@main/plugins/sitegraph/assets/kernel.css" }
```

Structural classes/IDs (`#sitegraph-rail`, `.sitegraph-page`, `.sitegraph-breadcrumb`,
`.sitegraph-footer`, `.sitegraph-pager`, `.sitegraph-full-tree`) are managed by the
script — don't reuse them in hand-authored content. Free to use anywhere in your own
markup:

```html
<span class="badge badge-pass">PASS</span>
<span class="badge badge-warn">NEEDS REVIEW</span>
<span class="badge badge-fail">FAIL</span>

<div class="callout">Heads up: this run used a staging dataset.</div>
<div class="callout callout-fail">3 checks failed — see below.</div>

<div class="metric">
  <span class="metric-value">99.98%</span>
  <span class="metric-label">Uptime</span>
</div>
```

`table`, `pre`, and `code` are styled automatically — no classes needed. The kernel
also ships a `@media print` stylesheet that hides the rail/breadcrumb/footer, so
reports print/PDF cleanly.

## Troubleshooting

- **`no <head/body> anchor found for "..." block — skipped`**: the page is missing
  that tag. Add it and rerun; other blocks on the same page are unaffected.
- **`--check` reports a page would update but you didn't touch it**: someone
  hand-edited inside a marker block, or a sibling page changed (which shifts that
  page's prev/next links). A normal rebuild repairs it.
- **A section shows the wrong title**: it's reading its `index.html`'s `<title>`; if
  there's no `index.html`, it falls back to the humanized directory name — add an
  `index.html` to override it.
- **Two pages resolve to the same displayed title**: harmless — titles are cosmetic
  labels, not identifiers; links are always based on the real file path.

## Non-Goals

sitegraph is for structured technical write-ups meant to be dropped in a directory
and linked forever: audits, commit/PR digests, metrics dashboards, contractor
showcases, telemetry views, weekly reports. It is deliberately not for blog posts,
marketing pages, or interactive web apps — there's no templating, no content
pipeline, and no JS framework, on purpose.
