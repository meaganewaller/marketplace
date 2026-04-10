# GitHub

Commands for interacting with GitHub issues and PRs using the gh CLI.

## Installation

```bash
/plugin install github@meaganewaller-marketplace
```

## Prerequisites

- [GitHub CLI (gh)](https://cli.github.com/) must be installed and authenticated

## Components

### Commands

- `/gh-issue-list` - List issues in the current repository
- `/gh-issue-create` - Create a new issue
- `/gh-issue-view` - View details of an issue
- `/gh-pr-list` - List pull requests in the current repository
- `/gh-pr-create` - Create a new pull request
- `/gh-pr-view` - View details of a pull request
- `/gh-pr-checkout` - Checkout a pull request locally
- `/gh-pr-address-comments` - Address outstanding PR review comments

## Usage

### Issues

```bash
# List open issues
/gh-issue-list

# Create a new issue
/gh-issue-create

# View issue #42
/gh-issue-view 42
```

### Pull Requests

```bash
# List open PRs
/gh-pr-list

# Create a PR from current branch
/gh-pr-create

# View PR #123
/gh-pr-view 123

# Checkout PR #123 locally
/gh-pr-checkout 123

# Address review comments on current branch's PR
/gh-pr-address-comments

# Address review comments on PR #123
/gh-pr-address-comments 123
```

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
