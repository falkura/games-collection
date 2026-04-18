# Layout

The layout system is a custom responsive layer on top of PixiJS — **not** `@pixi/layout`. Source lives in `packages/engine/src/layout/`. Two pieces do the work: `LayoutManager` (singleton on `Engine.layout`) and `LayoutContainer` (a `Container` subclass you place in the scene graph).

Games are authored in **virtual pixels**. You declare sizes and positions in expressions like `"sw/2"` or `"sh-100"`, and the layout system re-evaluates them on every resize and orientation flip.

## `LayoutManager` (`Engine.layout`)

Created during `Engine.initApplication()`. On every resize it:

1. Detects orientation — `isPortrait = height > width` — and picks the matching target size from the config you passed to `initApplication` (landscape or portrait).
2. Computes a fit-to-screen scale (`Math.min(width/targetWidth, height/targetHeight)`) and applies it to the stage.
3. Updates two rects used by all layout expressions:
   - `layout.game` — the virtual game rect (always the configured target size, centered on screen).
   - `layout.screen` — the virtual screen rect (same units as `game`, but larger on the over-fit axis).
4. Walks the tree and re-evaluates every `LayoutContainer`.

In systems, read `Engine.layout.screen` / `Engine.layout.game` / `Engine.layout.isPortrait` inside `resize()` to place things responsively.

`Engine.layout.isMobile` is also available when you need coarse device-class branching. It proxies Pixi's mobile detection (`isMobile.any`).

## `LayoutContainer`

A `Container` subclass that accepts a **layout config** and re-evaluates it on resize and on being added to the stage. You build your whole UI out of these.

### Config keys

| Key | Type | Notes |
| --- | --- | --- |
| `x`, `y` | `string \| number` | Evaluated as an expression (see below) against the layout vars. |
| `width` | `string \| number` | Evaluated; also written to `view` if one is attached. |
| `height` | `string \| number` | Same as `width`. |
| `zIndex` | `number` | Standard PixiJS zIndex — parent has `sortableChildren = true`. |
| `view` | `Container` | Optional inner child. `width`/`height` are forwarded to it. |
| `onResize` | `({ manager, vars }) => void` | Custom callback, runs after built-in handlers. |
| `portrait` | `Partial<LayoutConfig>` | Overrides applied when `LayoutManager.isPortrait` is true. |

### Layout expressions

Strings are evaluated as math expressions with these variables:

| Var | Meaning |
| --- | --- |
| `sw` | Screen width (virtual). |
| `sh` | Screen height (virtual). |
| `smax` | `Math.max(sw, sh)`. |
| `gx` | Game rect X (game offset inside screen on the over-fit axis). |
| `gy` | Game rect Y. |
| `gw` | Game rect width. |
| `gh` | Game rect height. |

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

See [layout-example.md](./layout-example.md) for copy-paste patterns.
