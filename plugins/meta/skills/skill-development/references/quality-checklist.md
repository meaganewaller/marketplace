# Skill Quality Checklist

Use this checklist when creating or auditing a Claude Code plugin skill.

## Structure

- [ ] Skill directory uses kebab-case naming
- [ ] `SKILL.md` exists at the skill root (not nested deeper)
- [ ] Only needed subdirectories exist (`references/`, `scripts/`, `assets/`)
- [ ] Every file referenced from `SKILL.md` exists

## Frontmatter

- [ ] `name` field is present and matches the directory name
- [ ] `description` field is present
- [ ] Description uses third-person phrasing
- [ ] Description includes specific trigger phrases users would say
- [ ] Description states when to use the skill, not just what it contains

## Content

- [ ] Body uses imperative/infinitive instructions, not second person
- [ ] `SKILL.md` is under 500 lines
- [ ] Detailed material lives in `references/` rather than the main file
- [ ] No duplicated content between `SKILL.md` and reference files
- [ ] Workflow steps are ordered and actionable
- [ ] Examples are complete and correct (if included)

## Progressive Disclosure

- [ ] Main file covers essential workflow only
- [ ] Reference files are linked with clear "when to load" guidance
- [ ] Scripts are documented with purpose and invocation
- [ ] Assets are separated from documentation that should be read into context

## Plugin Integration

- [ ] Skill lives under `plugins/<plugin>/skills/<skill-name>/`
- [ ] Plugin README lists the skill under Components
- [ ] Trigger phrases do not heavily overlap with sibling skills in the same plugin

## Severity Guide

| Severity | Examples |
| --- | --- |
| **Critical** | Missing `SKILL.md`, missing required frontmatter, broken reference paths |
| **Warning** | Vague description, `SKILL.md` over 500 lines, second-person writing |
| **Suggestion** | Missing examples, weak trigger phrases, README not updated |
