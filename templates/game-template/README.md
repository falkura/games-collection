---
skip: true
---

# Game Template

A [Tera](https://tera.netlify.app/) template used by [Moon codegen](https://moonrepo.dev/docs/guides/codegen) to scaffold new games in the monorepo.

```bash
moon generate game    # scaffold a new game, prompts for a name
```

The generated game is a fully wired application project: uses the shared [engine](../../packages/engine/README.md) for rendering and lifecycle, [game-base](../../packages/game-base/README.md) for base game structure. After generation, run `bun install` to link workspace dependencies.

> This README is not included in generated games. The generated game's README comes from [`GAME.README.md`](./GAME.README.md).
