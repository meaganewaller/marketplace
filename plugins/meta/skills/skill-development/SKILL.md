---
name: skill-development
description: >-
  This skill should be used when the user asks to "create a skill", "add a skill
  to plugin", "write a new skill", "improve skill description", "organize skill
  content", "audit a skill", or needs guidance on SKILL.md structure,
  progressive disclosure, trigger phrases, or skill quality for Claude Code
  plugins.
---

# Skill Development

Guidance for creating and evaluating Claude Code plugin skills.

## What Skills Provide

Skills extend Claude with specialized workflows, domain knowledge, and bundled
resources. Each skill is a directory with a required `SKILL.md` and optional
`references/`, `scripts/`, and `assets/` subdirectories.

## Directory Layout

```text
plugin-name/skills/skill-name/
├── SKILL.md              # Required
├── references/           # Loaded on demand
├── scripts/              # Deterministic utilities
└── assets/               # Templates and output files
```

Plugin skills live under `plugins/<plugin>/skills/` and are auto-discovered.

## Creation Workflow

1. **Gather examples** — Identify concrete user phrases that should trigger the
   skill. Skip only when usage is already clear.
2. **Plan bundled resources** — Decide what belongs in `references/`, `scripts/`,
   or `assets/` instead of the main file.
3. **Scaffold the directory** — Create only subdirectories that will be used.
4. **Write SKILL.md** — Frontmatter plus lean procedural instructions.
5. **Validate** — Run the quality checklist in `references/quality-checklist.md`.
6. **Iterate** — Strengthen triggers and move bulky content to references after
   real use.

## Frontmatter

Required fields: `name`, `description`.

Write `description` in third person with explicit trigger phrases:

```yaml
---
name: skill-development
description: >-
  This skill should be used when the user asks to "create a skill", "audit a
  skill", or needs guidance on SKILL.md structure for Claude Code plugins.
---
```

Avoid vague descriptions like "Provides skill guidance" or second-person
phrasing like "Use this skill when...".

## Writing Style

- Use imperative/infinitive form ("To validate, read...") not second person.
- Keep `SKILL.md` under 500 lines; target ~1,500 words in the body.
- Put schemas, long examples, and detailed checklists in `references/`.
- Do not duplicate content between `SKILL.md` and reference files.
- Reference bundled files explicitly so Claude knows when to load them.

## Progressive Disclosure

1. **Metadata** — `name` + `description` always available for discovery.
2. **SKILL.md body** — Loaded when the skill triggers.
3. **Bundled resources** — Loaded or executed only when needed.

Prefer scripts for repeated deterministic checks. Prefer references for
documentation Claude should read selectively.

## Plugin Considerations

- Skill directory names use kebab-case.
- The main file must be named `SKILL.md` (not `README.md`).
- Skills at plugin root `skills/` are discovered automatically.
- After adding a skill, update the plugin `README.md` components section.

## Quality Review

Before finishing, evaluate the skill against
`references/quality-checklist.md`. For a structured audit command, use
`/meta:audit-skill`.

## Additional Resources

- **`references/quality-checklist.md`** — Pass/fail criteria for skill audits
