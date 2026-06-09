# Dev Collective

Transforms your terminal into a professional engineering team: language domain experts (Ruby/Rails, Bash, Python, Rust, Go), strategic roles, quality and ops specialists, and SDLC lifecycle skills, summoned via a dispatcher and per-role commands.

## Installation

```bash
/plugin install dev-collective@meaganewaller-marketplace
```

## The Org Chart

Dev Collective models a full engineering organization in four layers. Agents are the *people*, skills are the *processes* they follow, and commands are how you summon them.

### Language domain experts

Deep, idiomatic engineers who write and modify code in their stack.

| Agent | Stack |
|-------|-------|
| `rails-engineer` | Ruby 3.x/4 and Rails 8 — Active Record, Hotwire/Turbo, service objects, RSpec |
| `python-engineer` | Python 3.12+ — type hints, async, `uv`/`ruff`/`mypy`/`pytest` |
| `rust-engineer` | Rust — ownership, error handling, async (tokio), cargo/clippy |
| `go-engineer` | Go — simplicity, explicit errors, goroutines, table-driven tests |
| `bash-engineer` | Bash/POSIX shell — safe scripting, shellcheck, shfmt, bats |

### Strategic roles

Direction and trade-off owners. They produce plans, designs, and decisions, then delegate implementation.

| Agent | Altitude |
|-------|----------|
| `cto` | Org/business-level technology strategy, build vs buy, multi-quarter bets |
| `principal-architect` | System and cross-service architecture, RFCs, decision records |
| `staff-engineer` | Hardest cross-cutting technical problems, standards, prototyping unknowns |
| `tech-lead` | Owns delivery of an effort — work breakdown, sequencing, unblocking |
| `product-manager` | Problem, user, scope, and success criteria — the "what/why," not the "how" |

### Quality and ops

The gatekeepers and operators.

| Agent | Focus |
|-------|-------|
| `code-reviewer` | Read-only review for correctness, design, readability, coverage |
| `qa-engineer` | Test strategy, the test pyramid, edge cases, regression coverage |
| `sre` | Reliability, observability, deployment, incident response, SLOs |
| `security-engineer` | Read-only threat modeling and vulnerability review (defensive) |

### Lifecycle skills

The SDLC spine. Skills activate automatically in context and drive process, not people.

| Skill | Phase |
|-------|-------|
| `team-orchestration` | Meta — routes any task to the right roles and phases |
| `discovery` | Frame the problem, clarify requirements, cut scope |
| `technical-design` | Design docs / RFCs, trade-offs, non-functional requirements |
| `implementation-workflow` | Work breakdown, sequencing, definition of done |
| `code-review-process` | Review gate with a severity taxonomy |
| `shipping` | Release readiness, rollout strategy, rollback plans |

## Commands

| Command | Purpose |
|---------|---------|
| `/dev-collective:assemble <task>` | Dispatcher — picks the team, phases, and sequencing automatically |
| `/dev-collective:tech-lead <task>` | Break a goal into a sequenced work plan with role assignments |
| `/dev-collective:architect <feature>` | Produce a design doc / RFC with trade-offs and a recommendation |
| `/dev-collective:cto <question>` | Org-level technology strategy and build-vs-buy guidance |
| `/dev-collective:review <scope>` | Severity-tagged code review (security-aware) |
| `/dev-collective:ship <change>` | Release-readiness assessment with rollout and rollback plan |

## Usage

### Let the dispatcher figure out who you need

```text
/dev-collective:assemble add rate limiting to the public API and ship it safely
```

The `assemble` command reads the task, applies the `team-orchestration` skill to choose roles and phases, shows you the plan and the "team" it picked, then runs the matching agents — in parallel when independent, sequentially when a phase depends on a prior one — and synthesizes a unified result. It right-sizes: a one-line fix does not spin up the whole org.

### Summon a specific role directly

```text
/dev-collective:architect a multi-tenant billing service
/dev-collective:review src/auth
/dev-collective:ship the new caching layer
```

### Skills trigger automatically

When you describe an engineering task, the relevant lifecycle skill activates on its own. Saying "what are we actually building here?" engages `discovery`; "is this ready to merge?" engages `code-review-process`.

## Design

- **Agents** carry deep, durable expertise and are addressable as subagent types (`dev-collective:rails-engineer`, etc.).
- **Skills** follow progressive disclosure — each `SKILL.md` is self-contained and under ~250 lines.
- **Commands** are thin entry points that launch the right agents and apply the right skills.

If the `ruby-rails` plugin is also installed, `rails-engineer` defers to its specialized skills (Active Record, testing, security, performance) for deep guidance.

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
