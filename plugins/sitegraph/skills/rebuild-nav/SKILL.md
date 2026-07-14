---
name: rebuild-nav
description: Rebuilds the sitemap and per-page navigation rail for a sitegraph static site by walking its folder structure. Use after adding, moving, renaming, or removing HTML pages under a sitegraph site root, or when asked to regenerate/refresh the nav rail, breadcrumbs, sitemap, or prev/next links.
---

# rebuild-nav

sitegraph treats the filesystem itself as the navigation graph: every directory is a
section, every `*.html` file is a page. This skill runs the one script that keeps the
generated parts of every page in sync with that structure. There is no other build
step.

## When to Use This Skill

Use this skill when:

- The user drops new HTML pages into a sitegraph site and wants the nav updated
- Pages were moved, renamed, or deleted and links/breadcrumbs need to catch up
- The user asks to "rebuild the nav", "regenerate the sitemap", "fix the rail", or
  similar
- Starting a brand-new sitegraph site (running the script on an empty/new directory
  bootstraps it — see [Bootstrapping a new site](#bootstrapping-a-new-site))
- Verifying nothing has drifted before a release/handoff (`--check` mode)

## Core Instructions

1. **Run the script** against the site root:

   ```bash
   bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" <site-root>
   ```

   `<site-root>` defaults to `.` if omitted. This requires `bun` — it is a zero-dependency
   script using only Bun/Node built-ins, no npm packages and no network access.

2. **Read the summary line** it prints, e.g. `sitegraph: 12 page(s) discovered, 3
   updated, 9 unchanged`. Files are only rewritten when their generated content
   actually changed, so diffs stay minimal across reruns.

3. **Surface warnings** (printed as `sitegraph warning: ...`) to the user instead of
   silently ignoring them. The most common cause is a page missing a `<head>` or
   `<body>` tag — the script skips just that block and keeps going rather than
   failing the whole run. See [references/authoring.md](references/authoring.md) for
   the minimal page skeleton that avoids this.

4. **Never hand-edit** the content between `<!-- sitegraph:head:start -->`,
   `<!-- sitegraph:nav:start -->`, or `<!-- sitegraph:footer:start -->` markers (and
   their matching `:end` markers), or `sitemap.html` itself — all of it is
   regenerated and overwritten on every run. Everything else in a page is left
   completely untouched.

5. **Use `--check` for drift detection** instead of a real rebuild when the user just
   wants to know if anything is out of date (e.g. before a release): it writes
   nothing and exits non-zero if a rebuild would change any file.

   ```bash
   bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" <site-root> --check
   ```

## Bootstrapping a New Site

There is no separate "init" skill — running rebuild-nav against a new or empty
directory does the bootstrapping:

- Writes a default `sitegraph.config.json` if one doesn't exist yet
- Generates an (initially empty) `sitemap.html` at the site root

After that, scaffold a minimal `index.html` for the user using the skeleton in
[references/authoring.md](references/authoring.md), then rerun the script so the new
page gets its nav rail and CSS link injected.

## How the Graph Is Derived

- **Directories** are sections; **`*.html`/`*.htm` files** are pages. Nothing else
  needs to be declared anywhere.
- A directory's `index.html`, if present, becomes that section's hub — its title
  labels the section in the rail/breadcrumb, and clicking the section links straight
  to it. Without an `index.html`, the section is still shown (expandable) but its
  label isn't a link.
- **Page title** = `<title>` text, else first `<h1>` text, else the humanized
  filename.
- **Order** = natural sort (numeric-aware) of the raw file/directory name, so a
  `01-`, `02-`, `10-` numeric-prefix convention sorts correctly without zero-padding.
  Dirs and files at the same level interleave by this same order.
- Dotfiles/dot-directories and anything listed in `sitegraph.config.json`'s `ignore`
  array are skipped entirely.

Full details, the config file schema, and the CSS helper classes (`badge`,
`callout`, `metric`, …) available to hand-authored content are in
[references/authoring.md](references/authoring.md) — read it before writing new
pages or troubleshooting a warning.

## Examples

<example>
user: I added three new audit pages under audits/2026-q1/. Can you wire them into the nav?
assistant: I'll run the rebuild-nav script — it discovers pages from the folder structure, so dropping them in was the whole job.
[Runs: bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" ./site]
sitegraph: 15 page(s) discovered, 4 updated, 11 unchanged. The three new pages now have a rail, breadcrumb, and sequential prev/next links; the sitemap was regenerated too.
</example>

<example>
user: Before I hand this report site off, make sure nothing's stale.
assistant: I'll run a dry-run check rather than rewriting anything.
[Runs: bun run "${CLAUDE_PLUGIN_ROOT}/skills/rebuild-nav/scripts/build-nav.ts" ./site --check]
Exit code was 1 and it reported 2 pages would update — someone likely hand-edited a marker block. Running a real rebuild will repair them; want me to?
</example>

## Reference Files

- `references/authoring.md`: page skeleton, marker-comment contract, config schema,
  CSS kernel helper classes, and troubleshooting (loaded on demand)
- `scripts/build-nav.ts`: the rebuild script itself
