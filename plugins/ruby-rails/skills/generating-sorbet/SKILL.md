---
name: generating-sorbet
description: This skill should be used when the user asks to "generate RBI files", "add Sorbet types without touching the source", "write .rbi shims", "type a gem for Sorbet", or "add signatures for generated code". Writes standalone .rbi files and never edits the Ruby source — the right choice for gems, generated code, and legacy files. In a Rails app it sends ActiveRecord and other DSL methods to `tapioca dsl` and writes only the remaining shims, under sorbet/rbi/shims/. For `sig { }` blocks written in the source itself, use generating-sorbet-inline; for RBS rather than Sorbet, use generating-rbs or generating-rbs-inline.
---

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

# Sorbet RBI Generation Skill

Generate or update Sorbet type signatures in separate `.rbi` files. Supports both full generation from scratch and partial updates for individual changed files. RBI files are used when you cannot or should not modify the original Ruby source - such as for gems, generated code, or legacy codebases.

# Instructions

When generating Sorbet RBI signatures, always follow these steps.

Copy this checklist and track your progress:

```text
Sorbet RBI Generation Progress:
- [ ] Step 0: Detect the project layout
- [ ] Step 1: Analyze the Ruby source
- [ ] Step 2: Generate RBI files
- [ ] Step 3: Eliminate `T.untyped` in signatures
- [ ] Step 4: Review and refine signatures
- [ ] Step 5: Validate signatures with Sorbet
```

## Rules

- You MUST NOT run the project's Ruby code. The exceptions are `srb tc` and the
  Tapioca generators in Step 0. Ask the user before running `tapioca dsl`,
  because it boots the app and needs its database.
- You MUST NOT hand-write signatures that Tapioca generates: gem RBIs and Rails
  DSL methods such as columns, associations, scopes, and enums.
- You MUST NOT edit files under `sorbet/rbi/gems/`, `sorbet/rbi/dsl/`, or
  `sorbet/rbi/annotations/`. Tapioca rewrites them; regenerate instead.
- You MUST NOT write `T.untyped` in a hand-written signature unless the type
  cannot be determined (see Step 3). Generated RBIs may contain it; leave them.
- You MUST NOT use `T.unsafe` - it bypasses type checking entirely.
- You MUST NOT use `T.cast` - it forces types without verification.
- You MUST ask the user to provide more details if something is not clear.
- You MUST run commands on the project's toolchain: `mise exec -- bundle exec <command>` when the project has a Gemfile (see [conventions](../../references/conventions.md)).
- You MUST use `sig { }` block syntax for method signatures.
- You MUST add `extend T::Sig` to classes/modules before using `sig`.
- You MUST NOT add method bodies in RBI files - only signatures and empty method definitions.
- You MUST place hand-written RBI files where Step 0 says: `sorbet/rbi/shims/`
  in an application, `rbi/` at the root of a gem.
- You MUST use the tracking file when processing multiple files to ensure no files are missed.

## Multi-File Processing

When processing multiple Ruby files, create a tracking file to ensure all files are covered:

1. **Create tracking file** `.sorbet-rbi-generation-todo.tmp`:

```text
   [ ] lib/legacy/billing.rb
   [ ] lib/legacy/invoice.rb
   [ ] app/services/auth_service.rb
   ```

1. **Process files one by one**:
   - Take the next pending `[ ]` entry
   - Complete all steps (1-5) for that file
   - Mark as processed `[x]`
   - Save the tracking file
   - Continue to next pending entry

2. **Cleanup**: Remove the tracking file after all files are processed:

   ```bash
   rm .sorbet-rbi-generation-todo.tmp
   ```

If interrupted, the tracking file allows resuming from where you left off.

## 0. Detect the Project Layout

Always perform this step. Where an RBI belongs depends on whether the project
is an application using Tapioca or a gem shipping its own RBIs.

| Signal | Layout |
|---|---|
| `sorbet/` directory, or `tapioca` in `Gemfile.lock` | Application with Tapioca |
| A `*.gemspec` at the root and no `sorbet/` directory | Gem |
| Neither | Ask the user; offer `tapioca init` for an application |

**Application with Tapioca.** Sorbet's RBIs live under `sorbet/rbi/`, split by
who writes them:

| Directory | Written by | Regenerate with |
|---|---|---|
| `sorbet/rbi/gems/` | Tapioca, from installed gems | `tapioca gem` |
| `sorbet/rbi/dsl/` | Tapioca, from Rails and other DSLs | `tapioca dsl` |
| `sorbet/rbi/annotations/` | Tapioca, from the community repository | `tapioca annotations` |
| `sorbet/rbi/shims/` | You | — |

Run Tapioca on the project toolchain, preferring the binstub when it exists:

```bash
mise exec -- bin/tapioca dsl               # all DSL RBIs
mise exec -- bin/tapioca dsl User Post     # only these constants
mise exec -- bundle exec tapioca gem       # without a binstub
```

Methods generated by ActiveRecord (columns, associations, scopes, enums),
ActiveSupport concerns, URL helpers, and other compilers Tapioca ships belong
to `tapioca dsl`. When the user asks to type them, run it (after asking, per
the Rules) instead of writing them by hand. Write a shim in `sorbet/rbi/shims/`
only for what Tapioca does not cover: a gem method its RBI gets wrong, or
metaprogramming in the app no compiler understands. `tapioca check-shims`
reports shims that duplicate generated RBIs.

**Gem.** Put hand-written RBIs in `rbi/` at the gem root. Tapioca reads that
directory from installed gems, so apps that depend on the gem get the
signatures without generating them.

## 1. Analyze the Ruby Source

Always perform this step.

Read and understand the Ruby source file:

- Identify all classes, modules, methods, constants and instance variables.
- Note inheritance, module inclusion and definitions based on metaprogramming.
- Note visibility modifiers - `public`, `private`, `protected`.
- Note type parameters for generic classes.

## 2. Generate RBI Files

Always perform this step.

1. Determine the correct RBI directory from Step 0: `sorbet/rbi/shims/` in an
    application, `rbi/` in a gem. Mirror the source path, so
    `lib/legacy/billing.rb` becomes `sorbet/rbi/shims/legacy/billing.rbi`.

    RBI files are needed to describe code Sorbet cannot understand statically:
    - Gem definitions (in an application, generated by `tapioca gem`)
    - Methods created with `define_method` or `method_missing`
    - Constants from `const_get`/`const_set`
    - Dynamic ancestors added via `extend`
    - DSL-generated methods (in an application, generated by `tapioca dsl`)

2. Create the RBI file with typed sigil:

    ```ruby
    # typed: strict
    ```

3. Add `extend T::Sig` to each class/module:

    ```ruby
    class MyClass
      extend T::Sig
    end
    ```

4. Add method stubs with signatures (no method bodies):

**Example - Ruby Source:**

```ruby
class User
  attr_reader :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def greet(greeting)
    "#{greeting}, #{@name}!"
  end
end
```

**Example - RBI File (`sorbet/rbi/shims/user.rbi`, or `rbi/user.rbi` in a gem):**

```ruby
# typed: strict

class User
  extend T::Sig

  sig { returns(String) }
  attr_reader :name

  sig { returns(Integer) }
  attr_reader :age

  sig { params(name: String, age: Integer).void }
  def initialize(name, age); end

  sig { params(greeting: String).returns(String) }
  def greet(greeting); end
end
```

- RBI files mirror structure but contain only signatures and empty method stubs
- See [syntax.md](references/syntax.md) for the full Sorbet RBI syntax guide

## 3. Eliminate `T.untyped` in Signatures

Always perform this step.

- Review all signatures and replace `T.untyped` with proper types.
- Use code context, method calls, and tests to infer types.
- Use `T.untyped` only as a last resort when the type cannot be determined,
  and tell the user which signatures still have it.

## 4. Review and Refine Signatures

Always perform this step.

- Verify signatures are correct, coherent, and complete.
- Remove unnecessary `T.untyped` types.
- Ensure all methods and attributes have signatures.
- Verify class hierarchy and module inclusions match the source.
- Fix any errors and repeat until signatures are correct.

## 5. Validate Signatures with Sorbet

Always perform this step.

Run Sorbet type checker to validate signatures:

```bash
mise exec -- bundle exec srb tc
```

This checks:

- Signature syntax correctness
- Type consistency
- Method parameter/return type matching
- Class/module structure matching source

Fix any errors reported and repeat until validation passes.

# References

- [syntax.md](references/syntax.md) - Sorbet RBI syntax guide
- [stripe-ruby examples](references/stripe-ruby/STRUCTURE.md) - Real-world RBI examples from stripe-ruby
- [Sorbet RBI documentation](https://sorbet.org/docs/rbi) - Official RBI docs
- [Tapioca README](https://github.com/Shopify/tapioca) - `gem`, `dsl`, and shim workflows

## See Also

- **generating-sorbet-inline** — same Sorbet types, written as `sig { }` blocks in the source
- **generating-rbs** — RBS `sig/**/*.rbs` files instead of Sorbet
- **ruby-mise-environment** — installing `sorbet`/`tapioca` and running them on the project Ruby
