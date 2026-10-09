---
name: review-diff
description: >
  Generates a structured PR review document from a diff or PR link: a short
  statement of what the PR does and whether the implementation matches its
  stated intent, a findings table (severity, category, file:line), and for
  each finding a reasoning explanation, a draft comment the reviewer will
  reword before posting, and a suggested diff when there's an unambiguous fix.
  Use this skill whenever the user asks to review a PR, review a diff, do a
  code review, check a pull request before merging, or pastes a
  diff and asks what's wrong with it. Also trigger on "--focus security",
  "--focus performance" etc. to narrow the scan to one category.
---

# Review Diff

Produce a review document, not review comments posted anywhere. The reviewer
will read the document, reword what they want to use, and post it themselves.
Nothing gets posted automatically by this skill.

## Inputs

Accept any of:

- A GitHub PR number or URL — pull it with the `gh` CLI, which is how the rest
  of this marketplace reaches GitHub:
  - `gh pr view <pr> --json title,body,author,url,baseRefName,headRefName`
    for the description, author, and link
  - `gh pr diff <pr>` for the diff
  - `gh repo view --json nameWithOwner -q .nameWithOwner` (or the URL's
    `owner/repo`) for the repo name used in review history
- A local branch or working tree — `git diff <base>...HEAD` for a branch,
  `git diff` / `git diff --staged` for uncommitted work. Use the branch's
  commit messages as the stated intent when there's no PR description.
- A pasted diff (raw `diff`/`patch` text)
- A GitHub/GitLab MCP connector, if one is active this session — use it when
  `gh` isn't installed or authenticated, or for a GitLab MR
- Any other PR/MR URL — fetch it with WebFetch if it's publicly reachable;
  otherwise ask the user to paste the diff

If only a diff is given with no description, proceed without one and note in
the "Understanding" section that intent is inferred from the diff alone.

## Workflow

1. **Load conventions** — before scanning, check whether the project's
   `.claude/pr-review-conventions.md` (at the repo root) has entries relevant
   to the files being reviewed; if the file doesn't exist, there are none.
   Read it via the `team-conventions` skill if unsure how to interpret an
   entry. Do not flag anything the conventions file explicitly permits.

2. **Build understanding** — write 2-4 sentences: what the PR changes, the
   inferred or stated intent, and whether the implementation appears to match
   that intent. Call out anything that seems inconsistent with the PR's
   stated purpose (e.g. a "docs only" PR that touches retry logic).

3. **Run scan passes.** Run all of these unless a `--focus` flag narrows it:
   - **Correctness** — logic errors, edge cases, off-by-ones, unhandled nulls
   - **Security** — injection, auth/authz gaps, secrets, unsafe deserialization
   - **Performance** — N+1 queries, unnecessary allocation, blocking calls in
     hot paths, unbounded loops
   - **Maintainability/tests** — naming, duplication, missing or weak test
     coverage for the changed behavior

   Only flag what the diff and visible surrounding context actually support.
   Do not invent issues to fill out categories with nothing wrong.

4. **Check history** — if the project's `.claude/pr-review-history.local.json`
   has prior findings for this repo/author on a similar pattern, note the
   recurrence in that finding's reasoning (see `review-history` skill) rather
   than treating it as a fresh one-off.

5. **Assign severity** per finding:
   - `Blocking` — will cause a bug, security issue, or data problem in prod
   - `Should-fix` — real problem, not urgent enough to block merge
   - `Nit` — style/preference, safe to ignore

6. **Write the document** using the template in `references/document-template.md`.
   Fill in every section. Only include a "Suggested fix" block when there's a
   concrete, unambiguous change — skip it for findings that need judgment
   calls (e.g. "consider renaming this").

7. **Deliver** the document inline in your response, so the reviewer can
   scan the table and copy individual draft comments straight out of the
   conversation. If the user asks for a file, write it where they ask
   instead (default to the scratchpad directory, not the repo under review,
   so it never lands in a commit). Do not post anything to GitHub/GitLab
   even if `gh` or a connector with write access is available, unless the
   user explicitly asks you to post a specific comment after reviewing the
   document.

8. **Log findings** — once the document is delivered, append every finding
   to `.claude/pr-review-history.local.json` as described in the
   `review-history` skill's "Logging" section. Do this on every run, not
   only when asked; step 4's recurrence check has nothing to compare against
   otherwise. Take `repo` and `author` from the PR metadata gathered under
   Inputs; for a pasted diff or local branch with no PR, use the repo from
   `git remote get-url origin` (or the directory name) and `"unknown"` for
   the author rather than guessing. Skip logging only when the findings
   table is empty.

## Output rules

- Every draft comment must be labeled as a draft the reviewer will reword —
  never phrase it as if Claude is about to post it.
- File:line references must match the diff's post-change line numbers so the
  reviewer can jump straight to the spot.
- Keep the "Understanding" section short — it's an anchor for the review, not
  a full restatement of the PR description.
- If the diff is small and clean, say so plainly in the Understanding section
  and produce an empty or near-empty findings table rather than padding it.

See `references/document-template.md` for the exact output format and a
filled-out example.
