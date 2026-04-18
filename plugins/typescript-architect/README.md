# TypeScript Architect

TypeScript architecture, SOLID principles, design patterns, and clean code standards for building maintainable Bun/TypeScript applications.

## Installation

```bash
/plugin install typescript-architect@meaganewaller-marketplace
```

## Components

### Skills

Each skill is highly specialized following the Single Responsibility Principle:

| Skill | Purpose |
|-------|---------|
| `solid-principles` | Analyze and apply SOLID principles to TypeScript code |
| `design-patterns` | Select and implement design patterns (creational, structural, behavioral) |
| `type-system-design` | Advanced TypeScript types: generics, branded types, conditional/mapped types |
| `frontend-architecture` | React component architecture, state management, project structure with Bun |
| `backend-architecture` | Bun.serve() API design, service layers, repository patterns, error handling |
| `code-quality-audit` | Audit code for complexity, coupling, type safety, and clean code violations |

### Agents

| Agent | Purpose |
|-------|---------|
| `architecture-reviewer` | Read-only agent that reviews code for architectural quality and SOLID compliance |

### Commands

| Command | Purpose |
|---------|---------|
| `/typescript-architect:audit <path>` | Run a systematic code quality audit |
| `/typescript-architect:architect <description>` | Get architecture guidance for designing a feature |

### Hooks

(None)

### MCP Servers

(None)

## Usage

### Get architecture guidance for a new feature

```text
/typescript-architect:architect user authentication with JWT and refresh tokens
```

### Audit existing code

```text
/typescript-architect:audit src/services
```

### Skills are triggered automatically

Skills activate based on context. For example, when reviewing code for SOLID violations, the `solid-principles` skill provides TypeScript-specific guidance with the decision framework and reference material.

## Skill Design

Each skill follows progressive disclosure:

- **SKILL.md**: Core guidance, decision frameworks, quick reference (< 500 lines)
- **references/**: Detailed patterns, examples, and checklists loaded on demand

This keeps context lean while providing deep expertise when needed.

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
