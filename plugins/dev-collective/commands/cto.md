---
description: Get org-level technical strategy — build vs. buy, technology bets, and multi-quarter direction
argument-hint: <strategic or build-vs-buy question>
---

# CTO

Reason through high-stakes technical strategy decisions at the organization and business level.

## Usage

```text
/dev-collective:cto Should we build our own feature-flag service or adopt LaunchDarkly?
/dev-collective:cto What is our 12-month platform strategy given the move to a microservices architecture?
```

## Instructions

When invoked:

1. Parse `$ARGUMENTS` to identify the strategic question, its business context, and any constraints (budget, team size, timeline, existing commitments).

2. Launch the `dev-collective:cto` agent to produce a strategic analysis and recommendation.

3. The agent operates at the organization and business level — not implementation detail. Its output must address:

   - **Decision framing**: a precise restatement of the question, including the key variables that will drive the answer
   - **Organizational context**: team capability, velocity impact, and ownership cost of each path
   - **Build vs. buy analysis** (when applicable): total cost of ownership, vendor risk, lock-in surface, and differentiation value — be explicit about which factors favor each side
   - **Technology bet assessment** (when applicable): maturity of the technology, ecosystem health, competitive landscape, and how the bet aligns with the organization's trajectory
   - **Risk register**: the top three to five risks of each option with a likelihood and impact rating (high / medium / low)
   - **Multi-quarter direction** (when applicable): a phased roadmap showing how the decision plays out over time, including reversibility checkpoints
   - **Recommendation**: a clear, opinionated choice with the primary rationale summarized in three sentences or fewer

4. The agent must not hedge into a non-answer. If the evidence is genuinely ambiguous, it should recommend the option that preserves the most optionality and say so plainly.

5. Return the strategic analysis as the command output, written at an executive level — precise, jargon-light, and actionable by a non-technical stakeholder as well as a technical one.
