---
to: README.md
---

# {{ name | kebab_case }}

_Add a description of what this game does and how it works._

> Part of the [Games Collection](../../README.md) monorepo — built on shared [engine](../../packages/engine/README.md), shared [game-base](../../packages/game-base/README.md), and shared [ui](../../packages/ui/README.md).

### Install dependencies

```bash
bun install
```

### Usage

```bash
moon run {{ name | kebab_case }}:dev        # http://localhost:3000
moon run {{ name | kebab_case }}:build      # production build
```
