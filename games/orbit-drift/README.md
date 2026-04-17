# orbit-drift

A gravity-based strategy game across 10 procedurally generated levels. Drag anywhere to fire a slingshot impulse at your ship, then ride the pull of surrounding planets into stable orbits and collect every energy orb. Each planet's mass varies — bigger wells pull harder, and dim concentric rings show their reach. Plan your trajectory from the dashed preview before you release. Later levels add walls, chasers that track you, shooters that fire straight projectiles, and gravity shooters whose shots curve around planets. Time and shots are scored. Progress is saved between sessions; buttons let you retry or advance.

Built on matter-js for physics and collision, with a custom N-body gravity step layered on top. Levels are generated from screen dimensions (`Engine.layout.screen`) with safe-space margins around every spawn so orbs stay reachable and nothing spawns inside a planet.

> Part of the [Games Collection](../../README.md) monorepo — built on shared [engine](../../packages/engine/README.md) and shared [game-base](../../packages/game-base/README.md).

### Install dependencies

```bash
bun install
```

### Usage

```bash
moon run orbit-drift:dev        # http://localhost:3000
moon run orbit-drift:build      # production build
```
