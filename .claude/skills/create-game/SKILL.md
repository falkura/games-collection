---
name: create-game
description: Scaffold a new game in this monorepo — pick the right template (game vs game-react), generate it via Moon, and hand off to docs for gameplay implementation. Use when the user asks to create, start, add, or bootstrap a new game.
---

# Create a Game

You are scaffolding a new game in the `games-collection` monorepo. Work in short, direct steps.

## Step 1 — Pick the template

- **`game-react`** — needs DOM UI (menus, HUD, scoreboards, modals, mode/difficulty pickers).
- **`game`** — everything else (single-screen experiences, sims, generative toys, anything where the canvas is the whole UX and/or tweakpane the whole controls).

If unsure, ask the user.

## Step 2 — Generate

```bash
moon generate <template> -- --name '<Human Readable Name>'
bun install
```

`<template>` is `game` or `game-react`.

## Step 3 — Customize

1. **`games/<name>/README.md`** — replace the placeholder with one short paragraph on what the game does and how it plays.
2. **`games/<name>/assets/game.json`** `description` — launcher card copy. Describe what the **player** does.
