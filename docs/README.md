# Docs

Reference for developing games in this monorepo. Read in order for a first-time tour, or jump in when you need a specific topic.

| Doc                                | Purpose                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| [project.md](./project.md)         | Monorepo layout, commands, conventions, build pipeline, deployment. |
| [create-game.md](./create-game.md) | New game creation, the 1-minute workflow.                           |
| [game.md](./game.md)               | Complete game implementation instruction.                           |

## PixiJS reference

[`PIXIJS-docs.txt`](./PIXIJS-docs.txt) is the **PixiJS documentation** in a single LLM-friendly file (llmtxt.org format). It covers the whole PixiJS API — `Application`, `Container`, `Sprite`, `Graphics`, `Text`, `Ticker`, `Assets`, filters, events, the renderer, ecosystem libraries, and migration guides. Use it when you need authoritative answers about PixiJS itself rather than this monorepo's wrappers around it. Search inside the file for the type or topic you need; the engine, `GameBase`, layout, and asset docs above only describe what this project layers **on top** of PixiJS.

## How to keep these docs current

- Treat `docs/` as the source of truth for project knowledge. New design decisions, conventions, lifecycle changes, and architectural rules go **into the relevant doc here**, not into `CLAUDE.md`.
- When adding a new topic, either extend an existing doc or add a new file and link it from this index.
- The root [`CLAUDE.md`](../CLAUDE.md) deliberately stays minimal and only points at this folder.
