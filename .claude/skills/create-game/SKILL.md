---
name: create-game
description: Scaffold a new game in this monorepo — pick the right template (game vs game-advanced), generate it via Moon, strip unused scaffolding, and hand off to docs/game.md for gameplay implementation. Use when the user asks to create, start, add, or bootstrap a new game.
---

# Create a Game

You are scaffolding a new game in the `games-collection` monorepo. Work in short, direct steps. Don't re-derive project structure.

## Step 1 — Pick the template

Two templates live in `templates/`. Default to **`game-advanced`**.

Pick **`game`** only if every one of these is true for the game being requested:

- One screen
- No win/lose state.
- No HUD, no overlay, no levels.

Examples where `game` is correct: cellular automata, boids / flocking sims, generative visual toys, ecosystem and other sims.

Examples that need `game-advanced`: puzzles, arcade games, anything with scoring, levels, rounds, restart buttons, or a win/lose screen.

If in doubt → `game-advanced`.

### What each template ships

| File                                                            | `game` | `game-advanced` | Purpose                                                           |
| --------------------------------------------------------------- | :----: | :-------------: | ----------------------------------------------------------------- |
| `src/<Name>.ts`                                                 |   ✓    |        ✓        | `GameController` subclass; registers systems.                     |
| `src/index.ts`                                                  |   ✓    |        ✓        | Boot — `Engine.init(...)`.                                        |
| `src/systems/MainSystem.ts`                                     |   ✓    |        ✓        | Gameplay. Advanced variant has level/progress/finish scaffolding. |
| `src/systems/IntroSystem.ts`                                    |   ✓    |        ✓        | Intro screen, tap-to-start.                                       |
| `src/systems/HUDSystem.ts`                                      |        |        ✓        | Top-of-screen info (level, score, etc.).                          |
| `src/systems/OverlaySystem.ts`                                  |        |        ✓        | Win/lose overlay with restart + next buttons.                     |
| `src/storage.ts`                                                |        |        ✓        | `localStorage` helpers for persisted progress.                    |
| `src/types.ts`                                                  |        |        ✓        | `IFinishData`, `IHUDData`.                                        |
| `src/ui/UIButton.ts`, `UIButtonGroup.ts`                        |        |        ✓        | Reusable buttons used by the overlay.                             |
| `assets/game.json`, `assets/icon.png`                           |   ✓    |        ✓        | Generated metadata + placeholder icon.                            |
| `moon.yml`, `rspack.config.ts`, `package.json`, `tsconfig.json` |   ✓    |        ✓        | Build wiring — don't edit.                                        |

## Step 2 — Generate

To generate game run generator:

```bash
moon generate <template> -- --name '<Human Readable Name>'
bun install
```

`<template>` is `game` or `game-advanced`. The name is pascal-cased for the class, kebab-cased for the folder and is formatted automatically.

## Step 3 — After generation

In order:

1. **Rewrite `games/<name>/README.md`** — replace the `_Add a description..._` placeholder with one short paragraph covering what the game does and how it plays.
2. **Rewrite `description` in `games/<name>/assets/game.json`** — this is the launcher card copy. Describe what the **player** does, not what the code does.
3. Update game intro text in `games/<name>/src/systems/IntroSystem.ts` - this is the game intro that will be in game first launch for the player.
4. **Strip unused scaffolding (only for `game-advanced`):**
   - If no levels: remove the `Levels` Tweakpane folder in `addGameControls` in `<Name>.ts`, and remove `nextLevel` / `setLevel` / `getLevels` / level fields from `MainSystem`.
   - If no persisted progress: delete `src/storage.ts` and its import in `MainSystem`.
   - If no overlay needed (rare — only for single-session games): remove `OverlaySystem` registration and the overlay's enable in `finish()`.
5. **Implement gameplay.** Read `docs/game.md` for the mental model, lifecycle, layout, and event patterns.

## Step 4 — Verify

- `moon run <name>:build` — must succeed with zero TypeScript errors before calling the scaffold done. Type-checking verifies code correctness, not feature correctness.
