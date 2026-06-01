---
description: Generate a context window optimization report for all skills in a directory
argument-hint: <plugin-or-skills-path> [--top N]
allowed-tools: Read, Grep, Glob, Bash
---

# Context Optimization Report

Produce a detailed context-window optimization report for every skill under a
plugin or skills directory. Identify large files, categorize by size, rank
modularization priorities, and recommend concrete fixes.

Part of the **meta** plugin evaluation suite. Complements `/meta:audit-skill`
(quality checklist) and `/meta:skills-eval` (compliance). Focus here is **token
footprint and progressive disclosure**, not behavioral testing.

## When To Use

Apply this workflow when:

- Assessing overall skill portfolio efficiency across a plugin
- Running pre-publish verification before releasing plugins
- Planning modularization priorities across many skills
- Identifying large files that should move to `references/` or split into sibling skills

## Usage

```text
/meta:context-optimization-report plugins/meta
/meta:context-optimization-report plugins/git/skills
/meta:context-optimization-report plugins/ruby-rails --top 10
```

Optional `--top N` limits the **Largest files** and **Priority queue** sections to
the top N offenders (default: show all files over the moderate threshold).

## Instructions

When invoked:

1. **Resolve scope** — Parse `$ARGUMENTS` (strip `--top N` flags first):
   - Plugin path (contains `.claude-plugin/plugin.json`) → all `skills/*/`
   - Path ending in `/skills` → each immediate subdirectory with `SKILL.md`
   - Any directory containing one or more `**/SKILL.md` skill roots
   - If empty, default to `plugins/meta` or ask the user

2. **Apply standards** — Load **modular-skill-framework** (especially
   `references/token-efficiency.md`) and **skill-development** sizing targets:
   - `SKILL.md` body: under 500 lines; ~1,500 words for core workflow
   - Single reference: split if >~2,000 words (use line count as proxy)
   - `description` frontmatter: focused triggers, not an encyclopedia

3. **Discover skills** — Glob `skills/*/SKILL.md` for plugin scope, or
   immediate subdirectories with `SKILL.md` for a flat skills folder.

4. **Measure each skill** — For every skill directory, collect metrics with
   Bash (`wc -l`, `wc -c`) on:
   - `SKILL.md`
   - Every file under `references/`, `scripts/`, `assets/` (if present)
   - Total lines per skill (sum of all text files above)

   Optionally estimate words: `wc -w` on `SKILL.md` when flagging verbosity.

5. **Categorize files by size (lines)**

   | Tier | Lines | Label |
   | --- | --- | --- |
   | S | 1–80 | compact |
   | M | 81–150 | moderate |
   | L | 151–300 | large |
   | XL | 301–500 | very-large |
   | XXL | >500 | oversized |

   **SKILL.md severity overrides:**

   | Lines | Status |
   | --- | --- |
   | ≤150 | OK for trigger load |
   | 151–300 | warning — lean body or move detail to references |
   | 301–500 | warning — likely hurts trigger context |
   | >500 | critical — violates skill-development target |

6. **Portfolio analysis** — Compute aggregates:
   - Total skills, total files measured, total lines
   - Skills ranked by total footprint (descending)
   - Count of oversized `SKILL.md` and XL+ reference files
   - Skills with no `references/` but `SKILL.md` over 150 lines
   - Skills where references total lines exceed `SKILL.md` (healthy split vs bloat)
   - `description` length outliers (grep frontmatter between `---` blocks; flag >80 words)

7. **Cross-skill signals** — Light Grep pass when feasible:
   - Duplicate section headings across `SKILL.md` files in scope
   - Same filename in multiple `references/` (possible duplication)
   - Do not load full file contents into the report; cite paths and line counts only

8. **Recommendations** — Per finding, map to an action from modular-skill-framework:

   | Signal | Recommendation |
   | --- | --- |
   | Oversized `SKILL.md` | Move checklists/schemas/examples to `references/`; link with when-to-load |
   | Very-large reference | Split reference by concern or split skill if triggers differ |
   | No references, large body | Introduce `references/`; keep procedural core in `SKILL.md` |
   | Bloated `description` | Narrow triggers; split sibling skill if tasks differ |
   | High total footprint, single skill | Consider **modular-skill-framework** split heuristics |
   | Duplicate reference names | Consolidate canonical doc; link from other skills |

9. **Pre-publish gate** — End with **Release readiness**:
   - **READY** — no critical `SKILL.md` issues; ≤1 very-large file per skill on average
   - **REVIEW** — warnings present but no critical oversized `SKILL.md`
   - **BLOCKED** — any `SKILL.md` >500 lines or >2 critical footprint issues

10. **Report** — Use the output format below. Do not modify files unless the user
    explicitly asks to apply fixes.

## Output Format

```markdown
# Context Optimization Report: <scope>

**Skills analyzed:** N
**Total measured lines:** N
**Release readiness:** READY | REVIEW | BLOCKED

## Executive Summary
<one paragraph: portfolio health, top risk, recommended first action>

## Portfolio Overview
| Metric | Value |
| --- | --- |
| Skills | N |
| Files measured | N |
| Total lines | N |
| Oversized SKILL.md (>500) | N |
| Skills with no references/ | N |
| Largest skill (by total lines) | name (N lines) |

## Skills by Total Footprint
| Rank | Skill | SKILL.md | References | Scripts | Assets | Total | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |

Status: OK | REVIEW | CRITICAL (based on SKILL.md tier and total size)

## Size Distribution
| Tier | Files | % of files |
| --- | --- | --- |
| compact (1–80) | N | N% |
| moderate (81–150) | N | N% |
| large (151–300) | N | N% |
| very-large (301–500) | N | N% |
| oversized (>500) | N | N% |

## Largest Files
| File | Lines | Tier | Skill |
| --- | --- | --- | --- |
<respect --top N if set>

## Per-Skill Detail

### <skill-name>
**Trigger load (SKILL.md):** N lines — OK | warning | critical
**Worst-case load (all bundled text):** N lines
**References:** N files, N lines

| File | Lines | Tier |
| --- | --- | --- |

**Issues**
- ...

**Recommendations**
- ...

## Modularization Priority Queue
| Priority | Skill | Action | Impact |
| --- | --- | --- | --- |
| P0 | ... | ... | high |
| P1 | ... | ... | medium |
| P2 | ... | ... | low |

<respect --top N if set; always include all P0>

## Cross-Skill Observations
- duplication, missing reference dirs, description bloat

## Suggested Follow-ups
- `/meta:audit-skill <path>` for checklist compliance on critical skills
- `/meta:skills-eval <plugin>` for quality + overlap
- **skill-auditor** agent for scored token-efficiency dimension
```

## Related Commands

| Command | Focus |
| --- | --- |
| `/meta:context-optimization-report` | Token footprint, size tiers, modularization plan |
| `/meta:audit-skill` | Single-skill quality checklist |
| `/meta:skills-eval` | Batch quality and optional behavioral probes |
| `/meta:validate-plugin` | Plugin layout and README inventory |
