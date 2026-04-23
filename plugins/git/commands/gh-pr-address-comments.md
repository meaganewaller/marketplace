---
description: Address outstanding pull request review comments
arguments:
  - name: pr_number
    description: PR number to address (defaults to current branch's PR)
    required: false
---

# Address PR Review Comments

Address valid, outstanding review comments on a pull request.

## Instructions

1. **Get the PR number:**
   - If `pr_number` provided, use it
   - Otherwise, get current branch's PR: `gh pr view --json number -q '.number'`
   - If no PR exists for current branch, inform the user

2. **Fetch review comments:**

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments --jq '.[] | select(.in_reply_to_id == null) | {id, path, line, body, user: .user.login}'
   ```

3. **Filter for outstanding comments:**
   - Exclude comments that have been resolved
   - Exclude your own comments (bot or author)
   - Focus on actionable feedback (code changes requested)

4. **For each valid comment:**
   - Read the file at the specified path
   - Understand the context around the mentioned line
   - Determine if the feedback is valid and actionable
   - If valid, make the requested change
   - Skip if the comment is just a question, praise, or already addressed

5. **After addressing comments:**
   - Summarize what was changed
   - List any comments that were skipped and why

## Commands

Get PR for current branch:

```bash
gh pr view --json number,headRefName,url -q '.'
```

Get review comments:

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
```

Get pending reviews (requested changes):

```bash
gh pr view {pr_number} --json reviews -q '.reviews[] | select(.state == "CHANGES_REQUESTED")'
```

## Comment Types to Address

**Address these:**

- Code style suggestions (formatting, naming)
- Bug fixes or logic errors pointed out
- Missing error handling
- Performance improvements
- Security concerns

**Skip these:**

- Questions (respond verbally, don't change code)
- Praise or acknowledgments
- Comments already resolved in subsequent commits
- Subjective preferences without clear direction

## Example Workflow

```bash
# Get PR number
PR=$(gh pr view --json number -q '.number')

# Get repo info
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')

# Fetch comments
gh api "repos/$REPO/pulls/$PR/comments" --jq '.[] | {path, line, body}'
```
