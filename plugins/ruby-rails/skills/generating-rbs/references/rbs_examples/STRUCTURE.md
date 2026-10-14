# RBS Examples

RBS type signatures from [ruby/rbs](https://github.com/ruby/rbs) repository.

- [core/](core/STRUCTURE.md) - Ruby core library signatures
- [stdlib/](stdlib/STRUCTURE.md) - Ruby standard library signatures

## Provenance

| | |
|---|---|
| Upstream | [ruby/rbs](https://github.com/ruby/rbs), `core/` and `stdlib/` |
| Commit | [`64914eb`](https://github.com/ruby/rbs/tree/64914eb9983b70fb2c5630380f098952ea839e1f) (2026-01-13) |
| License | BSD-2-Clause or Ruby, at your option: [COPYING](COPYING), [BSDL](BSDL) |
| Vendored | 2026-05-27, in #18 |

The files are transformed, not copied verbatim:

- Comment-only lines are removed, which drops upstream's long rdoc blocks.
- The version directory under each library is flattened, so
  `stdlib/json/0/json.rbs` is `stdlib/json/json.rbs` here.
- Only `.rbs` files are kept (no `manifest.yaml`), and `stdlib/coverage/` is
  absent.

After that transform, every file matches upstream byte for byte at each `main`
commit from `ed47e6f` (2026-01-07) through `64914eb` (2026-01-13); the newest is
pinned above. That snapshot predates the rbs 4.0.0 release, which already
differed in 18 files, and later releases rename type parameters (for example
`Array[Elem]` to `Array[E]`). The former default gems (`abbrev`, `base64`,
`dbm`, and others) are still in upstream's `stdlib/`, so their presence here is
not a sign of staleness.

To refresh, set `rev` to a newer commit or tag and run from this directory:

```bash
rev=64914eb9983b70fb2c5630380f098952ea839e1f
up=$(mktemp -d)
git clone -q https://github.com/ruby/rbs.git "$up" && git -C "$up" checkout -q "$rev"
find core stdlib -name '*.rbs' -delete
(cd "$up" && find core stdlib -name '*.rbs' ! -path 'stdlib/coverage/*') |
  while read -r src; do
    dst=$(echo "$src" | sed 's#^\(stdlib/[^/]*\)/[^/]*/#\1/#')
    mkdir -p "$(dirname "$dst")"
    grep -v '^[[:space:]]*#' "$up/$src" > "$dst" || true
  done
cp -f "$up/COPYING" "$up/BSDL" .
```

Then update the commit above and the file lists in `core/STRUCTURE.md` and
`stdlib/STRUCTURE.md`.
