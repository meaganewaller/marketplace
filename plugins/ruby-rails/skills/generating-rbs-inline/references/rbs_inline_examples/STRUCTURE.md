# RBS-Inline Examples

Ruby gems that use rbs-inline type annotations as real-world references.

- [zeitwerk/](zeitwerk/) - https://github.com/fxn/zeitwerk

## Provenance

| | |
|---|---|
| Upstream | [fxn/zeitwerk](https://github.com/fxn/zeitwerk), `lib/` |
| Commit | [`0ddaddc`](https://github.com/fxn/zeitwerk/tree/0ddaddcd558d91d7a36af6624ed5108880ba0b61) (2026-01-31), after the v2.7.4 tag |
| License | MIT: [zeitwerk/MIT-LICENSE](zeitwerk/MIT-LICENSE) |
| Vendored | 2026-05-27, in #18 |

`zeitwerk/` is upstream's `lib/` verbatim, `.rb` files only. Every file matches
each `main` commit from `7d31b9d` (2025-12-25) through `0ddaddc` (2026-01-31);
the newest is pinned above. `version.rb` still reads 2.7.4 because no release
was cut in that range.

To refresh, set `rev` to a newer commit or tag and run from this directory:

```bash
rev=0ddaddcd558d91d7a36af6624ed5108880ba0b61
up=$(mktemp -d)
git clone -q https://github.com/fxn/zeitwerk.git "$up" && git -C "$up" checkout -q "$rev"
rsync -a --delete --prune-empty-dirs --exclude=MIT-LICENSE \
  --include='*/' --include='*.rb' --exclude='*' "$up/lib/" zeitwerk/
cp -f "$up/MIT-LICENSE" zeitwerk/
```
