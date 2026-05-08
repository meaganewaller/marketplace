---
description: Initialize mise.toml for the current project, detecting existing tool config files
arguments:
  - name: skip-trust
    description: Skip running mise trust and mise install after generating config
    required: false
---

# Initialize mise.toml

Scaffold a `mise.toml` for the current project by detecting existing tool configuration files and existing language/runtime usage.

## Instructions

1. Check if `mise.toml` already exists in the current directory. If it does, inform the user and ask if they want to augment it or abort.

2. Scan the project for existing idiomatic version files:
   - `.nvmrc` or `.node-version` → node version
   - `.ruby-version` → ruby version
   - `.python-version` → python version
   - `.java-version` → java version
   - `.go-version` → go version
   - `.terraform-version` → terraform version

3. Detect runtimes from project files if no idiomatic version files exist:
   - `package.json` (check `engines.node`) → node
   - `Gemfile` → ruby
   - `Pipfile`, `pyproject.toml`, `requirements.txt` → python
   - `go.mod` → go
   - `Cargo.toml` → rust

4. Check the user's global mise config at `~/.config/mise/config.toml`. Read the `idiomatic_version_file_enable_tools` setting if present:
   - If the detected tools are already covered by the global `idiomatic_version_file_enable_tools = "all"` setting, note this and ask the user if they still want to add explicit `[tools]` entries or rely on the idiomatic files.

5. For each idiomatic version file found, ask the user:
   - **Option A** — Add `idiomatic_version_file_enable_tools` to `mise.toml` so mise reads the existing files (good when teammates still use nvm/rbenv/etc.)
   - **Option B** — Copy versions into `[tools]` in `mise.toml` and delete the idiomatic files (cleaner, fully committed to mise)
   - **Option C** — Copy versions into `[tools]` and keep the idiomatic files (transitional)

6. Generate `mise.toml` with:
   - `[tools]` section with detected versions
   - An empty `[env]` section with a comment placeholder
   - A starter `[tasks]` section with common tasks inferred from the project:
     - If `package.json` has scripts: generate `mise run` wrappers
     - Otherwise: include placeholder `test`, `lint`, `build` tasks

7. Recommend adding `mise.local.toml` to `.gitignore` if not already present. Offer to add it.

8. Unless `--skip-trust` is passed:
   - Run `mise trust` to authorize the new config
   - Run `mise install` to install all defined tools
   - Report installed tool versions

## Example Output

```toml
[tools]
node = "22"
ruby = "3.3"

[env]
# Add project-scoped environment variables here
# DATABASE_URL = "postgres://localhost/myapp_dev"

[tasks.test]
run = "bun test"
description = "Run the test suite"

[tasks.lint]
run = "bunx biome check ."
description = "Lint and format check"
```
