# Layout

The layout system is a custom responsive layer on top of PixiJS — **not** `@pixi/layout`. Source lives in `packages/engine/src/layout/`. Two pieces do the work: `LayoutManager` (singleton on `Engine.layout`) and `LayoutContainer` (a `Container` subclass you place in the scene graph).

Games are authored in **virtual pixels**. You declare sizes and positions in expressions like `"sw/2"` or `"sh-100"`, and the layout system re-evaluates them on every resize and orientation flip.

## `LayoutContainer`

A `Container` subclass that accepts a **layout config** and re-evaluates it on resize and on being added to the stage. You build your whole UI out of these.

### Config keys

| Key        | Type                          | Notes                                                           |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| `x`, `y`   | `string \| number`            | Evaluated as an expression (see below) against the layout vars. |
| `width`    | `string \| number`            | Evaluated; also written to `view` if one is attached.           |
| `height`   | `string \| number`            | Same as `width`.                                                |
| `zIndex`   | `number`                      | Standard PixiJS zIndex — parent has `sortableChildren = true`.  |
| `view`     | `Container`                   | Optional inner child. `width`/`height` are forwarded to it.     |
| `onResize` | `({ manager, vars }) => void` | Custom callback, runs after built-in handlers.                  |
| `portrait` | `Partial<LayoutConfig>`       | Overrides applied when `LayoutManager.isPortrait` is true.      |

### Layout expressions

Strings are evaluated as math expressions with these variables:

| Var    | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| `sw`   | Screen width (virtual).                                       |
| `sh`   | Screen height (virtual).                                      |
| `smax` | `Math.max(sw, sh)`.                                           |
| `gx`   | Game rect X (game offset inside screen on the over-fit axis). |
| `gy`   | Game rect Y.                                                  |
| `gw`   | Game rect width.                                              |
| `gh`   | Game rect height.                                             |

Anything valid in a JS math expression works: `"sw/2"`, `"sh - 100"`, `"gx + gw"`, `"smax * 0.8"`, `"(sw - 800) / 2"`. Numeric literals (`200`) pass through unchanged.

## Where this fits

- `Engine.view` — the root `LayoutContainer` (`sw × sh`) that hosts the active game.
- Every `System` gets its own full-screen `LayoutContainer` at `this.view`, z-indexed by registration order.
- Add your display objects as children of `this.view` inside each system.
- For a child that should respond to orientation changes or layout vars, make it a `LayoutContainer` too.

## Screen vs game rect — which do I use?

- **`screen`** covers the full viewport. Use it for full-bleed backgrounds, edge-anchored HUDs, and anything that should reach the actual window bounds.
- **`game`** is your declared virtual play area. Use it for gameplay content that must stay inside the design-intent rect regardless of aspect ratio. Content outside the game rect is visible on over-fit axes (letterboxing in reverse) — great for decorative HUD, bad for anything critical.

## Choosing a gameplay viewport

Pick one of these patterns per system and stick to it.

### 1. Full-screen (`sw × sh`)

Default — `this.view` is already `sw × sh`. Use when gameplay is aspect-agnostic: procedural spaces, full-bleed HUDs, backgrounds that should reach the real edges.

```ts
const { width, height } = Engine.layout.screen;
// place stuff with `width`/`height`
```

### 2. Square viewport (`smin × smin`)

Use when gameplay is **square or orientation-agnostic** — grids, puzzles, arenas. One container, same shape in both orientations, no per-orientation branching:

```ts
const stage = new LayoutContainer({
  x: "sw/2 - smin/2",
  y: "sh/2 - smin/2",
  width: "smin",
  height: "smin",
});
this.view.addChild(stage);
// Work in 0..smin local coords inside stage — it stays centered and square.
```

With the default engine config (`1920×1080` landscape / `1080×1920` portrait), `smin = 1080` in either orientation. Building gameplay against a fixed `1080×1080` reference and dropping it into this container eliminates the orientation branch for the gameplay area. HUD and background live outside the square at `sw × sh`.

### 3. Game rect (`gw × gh` = `1920×1080`)

Use when the layout is **authored for a specific aspect ratio** and breaks if stretched. Work in `Engine.layout.game` coords; the layout scales the rect to fit and letterboxes on over-fit axes. Good for cutscenes, fixed-camera 16:9 games; bad for puzzles where you want the HUD to reach the screen edges.

## Tips

- **Prefer `LayoutContainer` over `System.resize()` math** when the thing you're positioning doesn't need per-frame logic. Layout expressions are cheaper to read and maintain.
- **Use `onResize` on a `LayoutContainer`** for one-offs like changing a `Text` fontSize by orientation — keeps the state out of a full `System.resize()` override.
- **Never hardcode `1920` / `1080`** in gameplay code. Derive bounds from `Engine.layout.screen`, `Engine.layout.game`, or your local container's `width/height`. Hardcoded numbers break the moment the virtual size changes.
- **Full-bleed backgrounds use `screen.width/height`**, not `game.*`, so they reach the real edges on over-fit axes.

## Examples

```ts
import { LayoutContainer, Engine } from "@falkura-pet/engine";
import { Graphics } from "pixi.js";

class MySystem extends System<MyGame> {
  private build() {
    // Multiple different texts can be packed into HTMLText
    this.text = new HTMLText({
      text:
        "<t1>BOIDS SIMULATION</t1><br><br>" + "<t2>TAP ANYWHERE TO START</t2>",
      resolution: Engine.textResolution, // this line is required for correct representation of text
      anchor: 0.5,
    });

    this.view.addChildWithLayout(this.text, {
      x: 30, // 30 px from left
      y: "sh - 80", // 80 px frpm screen bottom
      width: "sw - 60",
      height: 60,
      portrait: {
        y: "sh - 120",
        height: 100,
      },
      zIndex: 2,
      onResize({ manager, view }) {
        view.style.fontSize = manager.isMobile ? 46 : 32;
        view.style.tagStyles = {
          t1: {
            fill: C.title,
            fontWeight: "bold",
            fontSize: manager.isMobile ? 100 : 74,
          },
          t2: {
            fontSize: manager.isMobile ? 46 : 32,
            fill: C.accent,
            fontWeight: "bold",
          },
        };
      },
    });
  }
}
```

There's no flexbox — compose rows with explicit math.

```ts
const makeButton = (label: string, index: number, total: number) => {
  const w = 180,
    gap = 20;
  const rowWidth = total * w + (total - 1) * gap;
  return new LayoutContainer({
    x: `sw/2 - ${rowWidth / 2} + ${index * (w + gap)}`,
    y: "sh - 100",
    width: w,
    height: 60,
    portrait: { y: `sh - ${100 + index * 80}` }, // stack vertically in portrait
  });
};
```

## Gotchas

- **Don't nest huge expressions** — prefer doing the math in `onResize` for anything complex. Expressions are parsed each resize.
- **Child `Container`s aren't re-evaluated** — only `LayoutContainer`s are. Raw `Container`/`Graphics` children stay at whatever coordinates you gave them; update them in `System.resize()`.
- **Portrait config is a partial overlay** — you don't need to repeat unchanged keys.
