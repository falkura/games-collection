# Creating a new game

## 1. Scaffold

```bash
moon generate game -- --name '<Human Readable Name>'
bun install
```

This creates `games/<slug>/` from the template in `templates/`, wires it into the Moon workspace, and registers it in the wrapper's game picker.

## 2. Replace the placeholders

Two placeholders ship with the template and must be replaced before the game is shown:

- `games/<name>/README.md` — the `_Add a description..._` line.
- `games/<name>/assets/game.json` — the `description` field. This string is rendered on the launcher card in the wrapper, so describe what the **player** does, not how the code works.

## 3. Implement the game

All gameplay lives in **systems** — subclasses of `System` under `games/<name>/src/core/`. For a small game, put all the logic in `MainSystem.ts`. For a larger one, split by concern (`BoardSystem`, `InputSystem`, `ScoreSystem`, …) and register each in your game class:

```ts
// games/<name>/src/<GameName>.ts
import { GameBase } from "@falkura-pet/game-base";
import { BoardSystem } from "./core/BoardSystem";
import { InputSystem } from "./core/InputSystem";
import { ScoreSystem } from "./core/ScoreSystem";

export class MyGame extends GameBase {
  protected override init(): void {
    this.systems.add(BoardSystem);
    this.systems.add(InputSystem);
    this.systems.add(ScoreSystem);
  }
}
```

See [game-base.md](./game-base.md) for the `System` contract and [engine.md](./engine.md) for the lifecycle.

### Color convention

When specifying colors in game code, use **hex string representation** - `"#ffffff"`.

### Passing data through the systems

```ts
// In a gameplay system:
this.game.puzzleSolved({score: 80});

// In the game
onSolved(data) {
  const hud = this.systems.get(OverlaySystem);
  this.systems.enable(OverlaySystem);
  hud.puzzleSolved(data);
}

// In the OverlaySystem:
puzzleSolved({score}) {
  this.showWin(score);
}
```

## 4. Add assets

Drop images, audio, JSON, etc. into `games/<name>/assets/` — details in [assets.md](./assets.md).

## 5. Run it

```bash
moon run <name>:dev        # http://localhost:3000 with hot-reload (engine + game-base included)
moon run <name>:build      # production build in games/<name>/dist/
```

## 6. Verify

Before calling it done:

- `moon run <name>:build` succeeds with zero TypeScript errors.
