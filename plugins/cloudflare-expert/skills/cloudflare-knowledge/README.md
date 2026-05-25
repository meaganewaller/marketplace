# cloudflare-knowledge

Cloudflare platform knowledge skill for Workers, storage, AI, and Zero Trust.

## What This Is

`cloudflare-knowledge` is a reference-backed skill used by the `cloudflare-expert` plugin. It is designed to answer implementation and architecture questions across the Cloudflare stack without loading unnecessary context.

The skill acts as a lightweight orchestrator over focused reference files in `references/`.

## Installation

From marketplace:

```txt
/plugin install cloudflare-expert@meaganewaller-marketplace
```

## Scope

This skill covers:

- Workers development and Wrangler configuration
- Pages and Pages Functions
- Storage and state patterns (R2, D1, KV, Durable Objects, Queues, Hyperdrive)
- Workers AI usage and model selection
- Vectorize and RAG patterns
- MCP server development on Workers
- Zero Trust setup (Access, Tunnel, Gateway)
- Cost planning and optimization patterns

## Reference Files

The skill is intentionally split into topic-specific references:

- `wrangler-cli-and-config.md`: Wrangler commands, `wrangler.jsonc`, CI/CD
- `storage-services-deep-dive.md`: R2, D1, KV, Durable Objects, Queues, Hyperdrive
- `ai-workers-usage.md`: Workers AI usage patterns and operational guidance
- `ai-workers-models.md`: model selection and practical tradeoffs
- `mcp-server-development.md`: production MCP server design details
- `zero-trust-setup.md`: production Zero Trust rollout guidance
- `cost-comparison.md`: pricing and optimization strategy
- `third-party-integrations.md`: integrating external APIs from Workers

## When It Activates

Use this skill when you need to:

- Build or debug a Worker
- Choose between R2, D1, KV, Durable Objects, or Queues
- Add AI features (LLM, TTS, STT, image, embeddings, vision)
- Configure `wrangler.jsonc` bindings correctly
- Set up Cloudflare Tunnel or Zero Trust Access
- Compare costs or design a hybrid provider strategy

## How To Use It Well

1. Start with the concrete objective (for example: "build a queue-backed image pipeline").
2. Load only the relevant reference file(s) from `references/`.
3. Implement with the provided patterns.
4. Validate deployment and observability settings before rollout.

## Examples

- "Help me choose between D1 and Durable Objects for a collaborative editor."
- "Generate a `wrangler.jsonc` with R2, D1, KV, and AI bindings."
- "Set up a Worker that performs RAG with Vectorize and Workers AI."
- "Design a cost-optimized TTS routing strategy across providers."

## Related Plugin Components

From the `cloudflare-expert` plugin:

- Agent: `cloudflare-expert`
- Commands:
  - `/cloudflare-expert:cloudflare-worker`
  - `/cloudflare-expert:cloudflare-deploy`
  - `/cloudflare-expert:cloudflare-debug`
  - `/cloudflare-expert:cloudflare-tunnel`
  - `/cloudflare-expert:cloudflare-ai`

## Development

See `SKILL.md` for activation and orchestration behavior.
