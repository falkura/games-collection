# plinko

A Stake-style Plinko casino game. Place a bet, choose difficulty (Low / Medium /
High / Expert) and row count (8–16), then drop balls through a board of pegs.
The result is server-driven: the (currently fake) server returns the target bin
and the ball physics are nudged so the ball lands there. Includes autoplay,
history, balance and a settings panel.

> Part of the [Games Collection](../../README.md) monorepo — built on shared [engine](../../packages/engine/README.md)

### Install dependencies

```bash
bun install
```

### Usage

```bash
moon run plinko:dev        # http://localhost:3000
moon run plinko:build      # production build
```

### Architecture

- **PixiJS** — board, pegs, balls (custom 2D verlet-ish physics).
- **React** — all UI (bet panel, settings, history, balance).
- **Zustand** — shared state store (balance, bet, difficulty, rows, history).
- **Server adapter** — `src/server/PlinkoServer.ts` defines the contract.
  `FakePlinkoServer` is plugged in by default; swap for a real impl later.
