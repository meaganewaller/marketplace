---
description: List available mise tasks and run one interactively
arguments:
  - name: task
    description: Task name to run directly (skips the list step)
    required: false
  - name: args
    description: Arguments to pass to the task
    required: false
---

# Run mise Task

List available mise tasks and run one, or run a named task directly.

## Instructions

1. Check that a `mise.toml` exists in the current directory (or a parent). If not, suggest running `/mise-init` first.

2. Run `mise tasks --no-header` to get the list of available tasks with their descriptions.

3. If no `task` argument was provided:
   - Present the task list to the user in a readable format: task name and description
   - Ask which task they want to run
   - If the user selects a task that accepts arguments, ask if they have any arguments to pass

4. If a `task` argument was provided, skip the listing step and run it directly.

5. Run the selected task:

   ```bash
   mise run <task-name> [-- <args>]
   ```

6. Stream the output. If the task fails (non-zero exit):
   - Show the exit code and last few lines of output
   - Suggest common fixes based on the error (e.g., missing dependencies, missing env vars, tools not installed)
   - Offer to run `mise doctor` if tools seem to be missing

## Notes

- Tasks run with the full mise environment active — all tools and env vars from `mise.toml` are available
- To run without shell activation (e.g., in CI): `mise exec -- mise run <task>`
- Arguments after `--` are forwarded to the task command
