---
description: Get architecture guidance for designing a feature or module
argument-hint: <description-of-what-to-build>
---

# Architect Command

Provide architecture guidance for designing a new feature, module, or system.

## Usage

```text
/typescript-architect:architect user authentication with JWT
/typescript-architect:architect real-time notifications system
/typescript-architect:architect file upload and processing pipeline
```

## Instructions

When invoked:

1. **Understand the requirement**: Parse $ARGUMENTS to understand what needs to be built.

2. **Apply relevant skills**:
   - Use **backend-architecture** for server-side design
   - Use **frontend-architecture** for client-side design
   - Use **design-patterns** to select appropriate patterns
   - Use **solid-principles** to ensure the design follows SOLID
   - Use **type-system-design** for type structure recommendations

3. **Produce a design document** with:

### Architecture Overview

- High-level component diagram (text-based)
- Data flow description
- Key design decisions with rationale

### Module Structure

- Recommended directory layout
- File responsibilities
- Dependency graph

### Type Design

- Key interfaces and types
- Discriminated unions for state
- Branded types for IDs if needed

### Patterns Applied

- Which design patterns and why
- SOLID principle considerations

### Implementation Skeleton

- Key function/class signatures
- Handler -> Service -> Repository wiring
- Error handling approach

1. **Consider the Bun stack**: All recommendations should use Bun.serve(), Bun.sql, Bun.file, etc. -- not Express, pg, or Node.js APIs.

2. **Keep it practical**: Provide runnable code skeletons, not abstract diagrams. The user should be able to start implementing immediately.
