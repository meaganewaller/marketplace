---
description: Show the full dotfiles health snapshot — chezmoi diff, chezmoi status, and mise doctor in one go
---

# /dotfiles-status

Reports the current state of the dotfiles working tree and the local environment it manages:

1. **`chezmoi diff`** — what's drifted between source and destination
2. **`chezmoi status`** — which managed files have changes pending
3. **`mise doctor`** — toolchain health

## Steps

1. Resolve the dotfiles repo path via the **dotfiles-config** skill. If unresolved, prompt the user and save the answer.
2. Run each command from that directory:

```bash
cd "<repo_path>"
chezmoi diff
chezmoi status
mise doctor
```

1. Summarize the output for the user:
   - **Clean** — no diff, no status entries, mise doctor reports no issues
   - **Drift** — list the files that diverged, suggest `chezmoi apply <path>` or escalate to **chezmoi-source-guardian** for cross-file refactors
   - **mise issues** — list each issue with the suggested fix (often `mise install`, `mise prune`, or `mise upgrade`)

## Notes

- If `chezmoi diff` is empty but `chezmoi status` shows entries, the destination has changes Chezmoi hasn't seen yet (likely an out-of-band edit). Suggest `chezmoi re-add` or `chezmoi apply` depending on which side is right.
- macOS: `mise doctor` may flag `private_Library/` issues — those are darwin-only paths and expected to be missing on Linux.
- Don't run `chezmoi apply` from this command — that's `/dotfiles-apply`'s job.
