# star-battle

Star Battle is a logic puzzle on an N×N grid divided into N colored regions. Tap a cell to mark it eliminated, tap again to place a star, tap once more to clear. Place exactly K stars in every row, every column, and every region — and no two stars may touch, not even diagonally. Three difficulties: Easy (5×5, 1 star), Medium (7×7, 2 stars) and Hard (10×10, 2 stars). Puzzles are generated procedurally so every game is fresh.

> Part of the [Games Collection](../../README.md) monorepo — built on shared [engine](../../packages/engine/README.md)

### Install dependencies

```bash
bun install
```

### Usage

```bash
moon run star-battle:dev        # http://localhost:3000
moon run star-battle:build      # production build
```
