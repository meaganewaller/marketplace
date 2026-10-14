# Sorbet Examples

Ruby gems that use Sorbet type signatures as real-world references.

- [packwerk/](packwerk/) - https://github.com/Shopify/packwerk

## Provenance

| | |
|---|---|
| Upstream | [Shopify/packwerk](https://github.com/Shopify/packwerk), `lib/` |
| Commit | [`5b06827`](https://github.com/Shopify/packwerk/tree/5b06827b1d4be60a54dbf68a2cab5661b3fd3dcf) (2025-11-24), after the v3.2.3 tag |
| License | MIT: [packwerk/LICENSE](packwerk/LICENSE) (upstream's `LICENSE.md`) |
| Vendored | 2026-05-27, in #18 |

`packwerk/` is upstream's `lib/` verbatim, `.rb` files only, so the generator
templates are left out. Every file matches each `main` commit from `5a0cbbd`
(2025-07-16) through `5b06827` (2025-11-24); the newest is pinned above.
`version.rb` still reads 3.2.3 because no release was cut in that range.

To refresh, set `rev` to a newer commit or tag and run from this directory:

```bash
rev=5b06827b1d4be60a54dbf68a2cab5661b3fd3dcf
up=$(mktemp -d)
git clone -q https://github.com/Shopify/packwerk.git "$up" && git -C "$up" checkout -q "$rev"
rsync -a --delete --prune-empty-dirs --exclude=LICENSE \
  --include='*/' --include='*.rb' --exclude='*' "$up/lib/" packwerk/
cp -f "$up/LICENSE.md" packwerk/LICENSE
```
