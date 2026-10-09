# PR Review Co-Pilot

Generates a structured PR review document -- your understanding of the PR, a findings table, and per-finding reasoning, a draft comment, and (when unambiguous) a suggested fix. Nothing is posted anywhere automatically; the document is a workspace for you to reword and post yourself.

## Installation

```bash
/plugin install pr-review-copilot@meaganewaller-marketplace
```

## Components

### Skills

- **`review-diff`** -- the core skill. Takes a diff or PR link and produces the review document.
- **`team-conventions`** -- manages `.claude/pr-review-conventions.md` in your project, the file of settled team style decisions review-diff won't re-flag.
- **`review-history`** -- logs findings to `.claude/pr-review-history.local.json` in your project and flags recurring patterns instead of treating them as one-offs.

### Commands

(None yet)

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)

## Using it

Just ask, in plain language:

- "Review this PR: [link]" or paste a diff and ask for a review
- "Focus on security" to narrow the scan
- "Stop flagging X" or "we decided Y is fine" to add a team convention
- "Has this come up before in [repo]?" for a recurrence summary

## Connecting a git host (optional)

For GitHub, `review-diff` uses the `gh` CLI (`gh pr view`, `gh pr diff`) to pull the diff, PR description, and author -- give it a PR number or link. It can also review a local branch or uncommitted work via `git diff`, or a pasted diff. If you add a GitHub or GitLab MCP connector to your session, it uses that when `gh` isn't available or for GitLab MRs -- no plugin changes needed.

## Where it keeps state

Both files live in the project you're reviewing, not in the plugin. Each plugin update installs into a fresh directory, so anything written inside the plugin would be left behind on the next release.

- `.claude/pr-review-conventions.md` -- settled team decisions. It's created from a template the first time you add a rule; edit it directly any time, or ask Claude to add one. Commit it so the whole team reviews against the same rules.
- `.claude/pr-review-history.local.json` -- your own findings log. It's append-only and grows as you use the plugin; there's no cleanup step built in yet -- prune it manually if it gets large. It names PR authors, so keep it out of git (Claude warns you when it creates the file somewhere git isn't ignoring it):

  ```gitignore
  .claude/*.local.json
  ```

## Known limitations

- No git host connector bundled -- GitHub goes through `gh`; GitLab needs a connector or a pasted diff.
- Recurrence detection depends on consistent pattern-slug naming; it's a best-effort signal, not a guarantee.
- Severity tagging (Blocking/Should-fix/Nit) is Claude's judgment call and hasn't been calibrated against your specific bar yet -- expect to correct it a few times early on.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
