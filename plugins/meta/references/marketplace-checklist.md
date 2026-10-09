# Marketplace Plugin Checklist

Use when adding or validating a plugin in `meaganewaller-marketplace`.

## Name Validation

- [ ] Plugin name is kebab-case (lowercase letters, numbers, hyphens only)
- [ ] `plugins/<plugin-name>/` does not already exist (for new plugins)
- [ ] Name is not already listed in `.claude-plugin/marketplace.json`

## Required Files

- [ ] `plugins/<plugin-name>/.claude-plugin/plugin.json` exists
- [ ] `plugins/<plugin-name>/README.md` exists with Installation and Components sections
- [ ] `plugin.json` includes `name`, `description`, `version`, `license`, `author`
- [ ] `license` is `BlueOak-1.0.0` for marketplace plugins

## Marketplace Registration

Add an entry to `.claude-plugin/marketplace.json`:

- [ ] Entry sorted alphabetically by `name`
- [ ] `source` is `./plugins/<plugin-name>`
- [ ] `strict` is `true`
- [ ] `category` is appropriate (`development`, `utility`, `testing`, etc.)
- [ ] `tags` reflect plugin functionality
- [ ] `version` matches `plugin.json`

## Release-Please Registration

Add to `release-please-config.json` under `packages`:

```json
"plugins/<plugin-name>": {
  "component": "<plugin-name>",
  "extra-files": [
    {
      "jsonpath": "$.version",
      "path": ".claude-plugin/plugin.json",
      "type": "json"
    },
    {
      "jsonpath": "$.plugins[?(@.name=='<plugin-name>')].version",
      "path": "/.claude-plugin/marketplace.json",
      "type": "json"
    }
  ],
  "initial-version": "1.0.0",
  "release-type": "simple"
}
```

- [ ] Package entry sorted alphabetically by path
- [ ] `component` matches plugin name
- [ ] Both `extra-files` are present: `plugin.json` alone leaves the
  marketplace entry frozen at its first version, and
  `test/marketplace-versions.test.ts` fails without the second
- [ ] The marketplace `jsonpath` filters by `name`, not by array index, so
  reordering `marketplace.json` cannot redirect the update
- [ ] The marketplace `path` keeps its leading slash (repo-root-relative;
  release-please rejects `../`)

Add to `.release-please-manifest.json`:

- [ ] `"plugins/<plugin-name>": "<version>"` entry sorted alphabetically,
  where `<version>` is the `version` already in `plugin.json` (release-please
  reads the manifest as the last released version)

## Lint and Format

Stage new and modified registration files, then run:

```bash
git add plugins/<plugin-name>/ .claude-plugin/marketplace.json release-please-config.json .release-please-manifest.json
bun run lint-staged
```

- [ ] `biome check --write` passes on JSON files
- [ ] `markdownlint-cli2 --fix` passes on Markdown files
- [ ] `cspell lint` passes (add words to `cspell.json` if needed)

## Common Lint Fixes

| Failure | Fix |
| --- | --- |
| MD040 | Add language to fenced code blocks (`bash`, `json`, `text`) |
| cspell unknown word | Add to `cspell.json` or rephrase |
| biome formatting | Usually auto-fixed by `--write` |

## README Components Section

- [ ] Lists commands, skills, agents, hooks, and MCP servers
- [ ] Uses `(None yet)` for empty component types
- [ ] Documents usage scenarios or examples as components are added
