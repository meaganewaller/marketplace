---
name: generating-rbs
description: This skill should be used when the user asks to "add RBS signatures", "generate RBS for this file", "write .rbs files", "set up Steep", "type-check this Ruby with RBS", or "update sig/ after these changes". Writes standalone RBS signatures under sig/**/*.rbs and never edits the Ruby source. For RBS written as inline `# @rbs` comments in the source instead, use generating-rbs-inline; for Sorbet rather than RBS, use generating-sorbet or generating-sorbet-inline.
---

## Defaults

Assume mise-managed Ruby and Rails with `bin/*` binstubs — not rbenv, rvm, or
asdf. Read `${CLAUDE_PLUGIN_ROOT}/references/conventions.md` for versions,
command forms, and type-system pairing before running project commands.

# RBS Generate Skill

Generate or update pure RBS signatures for Ruby source files. Supports both full generation from scratch and partial updates for individual changed files. Does not handle RBS-inline signatures.

# Instructions

When generating RBS signatures from scratch, always follow these steps.

Copy this checklist and track your progress:

```text
RBS Generation Progress:
- [ ] Step 1: Analyze the Ruby source
- [ ] Step 2: Generate RBS signatures
- [ ] Step 3: Eliminate `untyped` types in generated signatures
- [ ] Step 4: Review and refine RBS signatures
- [ ] Step 5: Validate shape of RBS signatures
- [ ] Step 6: Ensure type safety (only if steep is configured)
```

## Rules

There are several rules that you MUST follow while performing this skill:

- You MUST not run Ruby code of the project.
- You MUST not use `untyped`. Infer the proper type instead.
- You MUST ask the user to provide more details if something is not clear.
- You MUST prepend any command with `bundle exec` if the project has Gemfile.
- You MUST use the tracking file when processing multiple files to ensure no files are missed.

## Multi-File Processing

When processing multiple Ruby files, create a tracking file to ensure all files are covered:

1. **Create tracking file** `.rbs-generation-todo.tmp`:

```text
   [ ] app/models/user.rb
   [ ] app/models/post.rb
   [ ] app/services/auth_service.rb
   ```

1. **Process files one by one**:
   - Take the next pending `[ ]` entry
   - Complete all steps (1-6) for that file
   - Mark as processed `[x]`
   - Save the tracking file
   - Continue to next pending entry

2. **Cleanup**: Remove the tracking file after all files are processed:

   ```bash
   rm .rbs-generation-todo.tmp
   ```

If interrupted, the tracking file allows resuming from where you left off.

## 1. Analyze the Ruby Source

Always perform this step.

Read and understand the Ruby source file:

- Identify all classes, modules, methods, constants and instance variables.
- Note inheritance, module inclusion and definitions based on metaprogramming.
- Note visibility modifiers - `public`, `private`, `protected`.
- Note type parameters for generic classes.

## 2. Generate RBS Signatures

Always perform this step.

- Create necessary `.rbs` files for the target Ruby file.
- Place generated RBS files in `sig/` directory mirroring Ruby source structure.
- You need to strongly follow RBS syntax conventions to describe types for all declarations
  - See [syntax.md](references/syntax.md) for the full list of RBS types. Double-check it in tricky cases.
- Take inspiration from RBS signature examples
  - See [rbs_by_example.md](references/rbs_by_example.md) for short list of RBS signatures examples
  - See [core](references/rbs_examples/core/STRUCTURE.md) for RBS signatures of Ruby core library
  - See [stdlib](references/rbs_examples/stdlib/STRUCTURE.md) for RBS signatures of Ruby standard library
  - Pay extra attention to `Data` and `Struct` types. See [data_and_struct.md](references/data_and_struct.md) for handling guide
  - See [gem_rbs_collection](https://github.com/ruby/gem_rbs_collection/tree/main/gems) for RBS signature examples of different Ruby libraries. This link contains only RBS files, Ruby sources are not included.

## 3. Eliminate `untyped` types in generated signatures

Always perform this step.

- Go through all generated signatures and replace `untyped` with the proper type.
- Use assumptions and calls examples in Ruby code and tests to infer the proper type.
- If you cannot infer the proper type, leave it as `untyped`.
  - It is a last resort, use it only when there is no other option.

## 4. Review and refine RBS signatures

Always perform this step.

- Take a look at the generated signatures and make sure they are correct, coherent and complete.
- Try to get rid of any unnecessary `untyped` types.
- If you find any errors, please fix them and repeat the process until there are no errors.

## 5. Validate shape of RBS signatures

Always perform this step.

- Run `rbs validate` to verify that existing and new `.rbs` files are internally consistent. It will check syntax, name resolution, inheritance, method overloading, type variables, etc.
- Fix any errors reported by `rbs validate` and repeat the process until there are no errors.

## 6. Ensure type safety of RBS signatures

Perform this step ONLY if the project Gemfile includes `steep` gem AND the project has Steepfile.

- Run `steep check` to verify that generated RBS signatures are type safe.
- Fix any errors reported by `steep check` and repeat the process until there are no errors.
  - Do not modify Steepfile in an attempt to fix errors.
- Roll back to step 4 if you fixed any errors reported by `steep check`.

# References

- [syntax.md](references/syntax.md) - The full list of RBS types and syntax
- [rbs_by_example.md](references/rbs_by_example.md) - Short list of RBS signatures examples
- [core](references/rbs_examples/core/STRUCTURE.md) - RBS signatures of Ruby core library
- [stdlib](references/rbs_examples/stdlib/STRUCTURE.md) - RBS signatures of Ruby standard library
- [data_and_struct.md](references/data_and_struct.md) - Explanation on `Data` and `Struct` types handling

## See Also

- **generating-rbs-inline** — same RBS types, written as `# @rbs` comments in the source
- **generating-sorbet** — Sorbet `.rbi` shims instead of RBS
- **ruby-mise-environment** — installing `rbs`/`steep` and running them on the project Ruby
