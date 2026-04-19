# Progressive Disclosure Pattern

Skills load their full SKILL.md into the conversation when invoked. Long skills consume context
budget and may get truncated during auto-compaction (first 5,000 tokens kept, 25,000 combined budget).

## Strategy

1. **SKILL.md** — concise overview, decision trees, quick references (< 500 lines)
2. **references/** — detailed guides, full examples, edge cases
3. **assets/** — templates, starter files, configuration examples

## How to Reference

In SKILL.md, point Claude to reference files when depth is needed:

```markdown
## Database Migrations

For standard migrations, use `rails generate migration`.

For complex scenarios (data migrations, zero-downtime, multi-step),
read `references/complex-migrations.md` before proceeding.
```

Claude will read the reference file only when the user's task matches that scenario.

## Directory Layout Examples

### Simple skill (1-2 references)

```text
my-skill/
├── SKILL.md
└── references/
    └── advanced.md
```

### Complex skill (many topics)

```text
my-skill/
├── SKILL.md
└── references/
    ├── configuration.md
    ├── troubleshooting.md
    ├── migration-guide.md
    └── api-reference.md
```

### Skill with templates

```text
my-skill/
├── SKILL.md
├── references/
│   └── patterns.md
└── assets/
    ├── template.ts
    └── config-example.json
```

## Anti-Patterns

- **Don't inline everything** — a 2,000-line SKILL.md wastes context on irrelevant sections
- **Don't over-split** — if a reference is 10 lines, keep it in SKILL.md
- **Don't require references** — SKILL.md should be self-sufficient for common cases
