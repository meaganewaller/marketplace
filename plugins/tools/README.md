# Tools Plugin

General purpose CLI tools: fd, ripgrep, jq, yq, shell scripting, ImageMagick, Mermaid diagrams, and universal dependency installation.

## Installation

```bash
/plugin install tools@meaganewaller-marketplace
```

## Components

### Skills

Agent skills live under `skills/` and are loaded automatically by context (they are not slash commands).

- `binary-analysis` — Reverse engineering and binary exploration using `strings`, `binwalk`, `hexdump`, `xxd`, `file`, and `objdump`. Use when identifying unknown file types, extracting strings from binaries, analyzing firmware, hunting hardcoded credentials, or running entropy analysis.
- `deps-install` — Universal dependency installer that auto-detects the project's package manager (uv, bun, npm, yarn, pnpm, cargo, go, bundler, brew) and runs the correct install command. Use when installing dependencies, adding packages, or syncing lockfiles without worrying which package manager applies.
- `fd-file-finding` — Fast file finding using `fd` with smart defaults, gitignore awareness, and parallel execution. Use when searching for files by name, extension, or pattern across directories.
- `imagemagick-conversion` — Convert and manipulate images with ImageMagick. Covers format conversion, resizing, batch processing, quality adjustment, and transformations. Use when converting images, resizing, or generating thumbnails.
- `jq-json-processing` — JSON querying, filtering, and transformation with `jq`. Use when parsing JSON files, filtering arrays/objects, or transforming JSON structures.
- `mermaid-diagrams` — Generate diagrams from text using the Mermaid CLI (`mmdc`) — flowcharts, sequence diagrams, ERDs, class diagrams, state machines, Gantt charts, and git graphs — with output as SVG, PNG, or PDF.
- `rg-code-search` — Fast code search using `ripgrep` with smart defaults, regex patterns, and file filtering. Use when searching text patterns or code snippets across a codebase.
- `shell-expert` — Shell scripting expertise, CLI tool usage, and system automation best practices. Covers bash, zsh, and POSIX shell including pipes, redirections, and portable scripting.
- `yq-yaml-processing` — YAML querying, filtering, and transformation with `yq`. Use when working with YAML config files, Kubernetes manifests, GitHub Actions workflows, or transforming YAML structures.

## Usage

Skills are invoked automatically when context matches. Trigger phrases:

- **Find files:** "find files named X", "search for *.ts files", "fd"
- **Search code:** "search for pattern X", "find all usages of Y", "rg"
- **Process JSON:** "parse this JSON", "filter this array", "jq"
- **Process YAML:** "update this manifest", "modify this workflow", "yq"
- **Generate diagrams:** "create a flowchart", "render this mermaid", "mmdc"
- **Install dependencies:** "install deps", "add package X", "run the package manager"
- **Image work:** "convert this image", "resize to 200px", "ImageMagick"
- **Shell scripting:** "write a bash script", "portable shell", "zsh"
- **Binary analysis:** "strings from this binary", "binwalk this firmware", "hexdump"

## Development

See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines.

## License

[Blue Oak Model License 1.0.0](../../LICENSE)
