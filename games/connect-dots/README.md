# Connect Dots

Connect each matching pair of colored dots with a single continuous line. Paths can move only orthogonally, cannot cross, and the board is solved only when every cell is filled.

Levels in this prototype are adapted from examples in Thomas Dybdahl Ahle's open-source `numberlink` repository:

- Repository: https://github.com/thomasahle/numberlink
- README examples used as bundled levels: the `5x4` parser example, the generated `40x10` example, and endpoint layouts extracted from the `10x10` and `20x20` `-tubes` examples

The repository README states that generated puzzles may be used with attribution.

> Part of the [Games Collection](../../README.md) monorepo - built on shared [engine](../../packages/engine/README.md) and shared [game-base](../../packages/game-base/README.md).

### Install dependencies

```bash
bun install
```

### Usage

```bash
moon run connect-dots:dev
moon run connect-dots:build
```
