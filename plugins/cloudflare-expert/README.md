# cloudflare-expert

Expert plugin for building, deploying, and operating Cloudflare-based systems with Workers, storage, AI, and Zero Trust.

## Installation

From marketplace:

```txt
/plugin install cloudflare-expert@meaganewaller-marketplace
```

## What This Plugin Includes

### Skills

- cloudflare-knowledge: Comprehensive Cloudflare platform guidance with focused reference files for Workers, storage, AI, Zero Trust, MCP, and cost optimization.

### Commands

- /cloudflare-expert:cloudflare-worker: Scaffold a Cloudflare Worker project with optional bindings.
- /cloudflare-expert:cloudflare-deploy: Validate and deploy Workers to production, staging, or preview.
- /cloudflare-expert:cloudflare-debug: Diagnose deployment, binding, performance, timeout, and runtime issues.
- /cloudflare-expert:cloudflare-tunnel: Create and configure a Cloudflare Tunnel for secure service exposure.
- /cloudflare-expert:cloudflare-ai: Generate production-ready Workers AI code for chat, TTS, STT, image, vision, embeddings, and RAG.

### Agents

- cloudflare-expert: Specialist agent for Cloudflare architecture, implementation, troubleshooting, and optimization.

### Hooks

- None currently.

### MCP Servers

- None currently.

## Core Coverage

This plugin is designed for day-to-day Cloudflare engineering work, including:

- Workers runtime and wrangler configuration
- R2, D1, KV, Durable Objects, Queues, and Hyperdrive decision-making
- Workers AI model usage and model selection
- Vectorize and RAG architecture patterns
- Zero Trust Access and Cloudflare Tunnel setup
- Deployment workflows, observability, and cost-aware design

## Typical Workflows

### 1. Create a new Worker

```txt
/cloudflare-expert:cloudflare-worker my-api kv,d1,ai
```

### 2. Deploy to staging or production

```txt
/cloudflare-expert:cloudflare-deploy staging
/cloudflare-expert:cloudflare-deploy production
```

### 3. Investigate operational issues

```txt
/cloudflare-expert:cloudflare-debug performance
/cloudflare-expert:cloudflare-debug binding
```

### 4. Expose a local service safely

```txt
/cloudflare-expert:cloudflare-tunnel my-app http://localhost:3000 app.example.com
```

### 5. Generate Workers AI implementation code

```txt
/cloudflare-expert:cloudflare-ai rag
/cloudflare-expert:cloudflare-ai tts
```

## Usage Notes

- Prefer cloudflare-knowledge for architecture and service selection questions.
- Use command tools when you need concrete scaffolding, deployment, or debugging workflows.
- Pair cloudflare-debug with cloudflare-deploy for preflight and post-deploy verification.

## Repository Structure

```text
plugins/cloudflare-expert/
├── agents/
│   └── cloudflare-expert.md
├── commands/
│   ├── cloudflare-ai.md
│   ├── cloudflare-debug.md
│   ├── cloudflare-deploy.md
│   ├── cloudflare-tunnel.md
│   └── cloudflare-worker.md
└── skills/
    └── cloudflare-knowledge/
        ├── SKILL.md
        └── references/
```

## Development

See ../../docs/DEVELOPMENT.md for plugin development standards.

## License

Blue Oak Model License 1.0.0: ../../LICENSE
