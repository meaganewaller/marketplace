---
name: ruby-language-idioms
description: This skill should be used when the user asks to "make this Ruby more idiomatic", "refactor this for clarity", "use pattern matching", "explain how blocks work", "choose between a module and a class", or asks about Enumerable, keyword arguments, frozen string literals, or RuboCop-friendly style. Covers plain Ruby outside Rails-specific APIs.
---

# Ruby Language Idioms

Write expressive, modern Ruby 4 code aligned with community style and this marketplace's tooling defaults.

## When to Use This Skill

- Refactoring Ruby for clarity
- Choosing between class methods, modules, and composition
- Explaining Ruby semantics (blocks, keywords, pattern matching)

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

## Core Guidance

1. **Favor readability**: Small methods, meaningful names, avoid clever one-liners.

2. **Blocks and enumerables**: Prefer `filter_map`, `index_by`, `each_with_object` over manual loops.

3. **Keyword arguments**: Use required keywords for public APIs; avoid option hashes unless interfacing with legacy APIs.

4. **Pattern matching** (Ruby 3+): Use `case/in` for structured data when it reduces nesting.

5. **Frozen string literals**: Match project pragma (`# frozen_string_literal: true`) consistently.

6. **Deprecations**: Ruby 4 continues tightening semantics — run the test suite after language upgrades.

7. **RuboCop**: Run `bundle exec rubocop` (or `mise run lint`) before large refactors.

## Quick Commands

```bash
mise exec -- ruby -e 'puts RUBY_VERSION'
mise exec -- bundle exec rubocop
mise exec -- bundle exec ruby -wc lib/
```

## Anti-Patterns

- Mutating strings when frozen literals are enabled
- `rescue Exception` or bare `rescue` without re-raise
- Metaprogramming when plain objects suffice

## See Also

- **ruby-rspec-testing** / **ruby-minitest-testing**
- **ruby-gem-development**
