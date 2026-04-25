---
skip: true
---

# Game Template (React UI)

Variant of the base game template wired with React for HTML/CSS UI on top of the PixiJS canvas. PixiJS still owns gameplay rendering; React owns menus, HUD, overlays — anything where DOM/CSS layout, real text rendering, or component state is easier than Pixi-side work.

A [Tera](https://tera.netlify.app/) template used by [Moon codegen](https://moonrepo.dev/docs/guides/codegen) to scaffold new games in the monorepo.

```bash
moon generate game-react    # scaffold a new React-UI game, prompts for a name
```

The generated game uses the shared `game-react` rspack/tsconfig configs (TSX support + react/react-dom types) and the global `uiRoot` div from the shared HTML template. Run `bun install` after generation to link workspace dependencies.

> This README is not included in generated games. The generated game's README comes from [`GAME.README.md`](./GAME.README.md).
