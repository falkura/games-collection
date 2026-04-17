# Layout examples

Copy-paste patterns for the custom layout system. Conceptual overview lives in [layout.md](./layout.md).

## 1. Centered element, full-screen parent

```ts
import { LayoutContainer } from "@falkura-pet/engine";
import { Graphics } from "pixi.js";

const panel = new LayoutContainer({
  x: "sw/2",
  y: "sh/2",
  width: 400,
  height: 300,
});
panel.pivot.set(200, 150);      // center pivot so x/y place the center
panel.addChild(new Graphics().rect(0, 0, 400, 300).fill(0x222222));
this.view.addChild(panel);
```

## 2. Header anchored to the top, stretching full width

```ts
const header = new LayoutContainer({
  x: 0,
  y: 0,
  width: "sw",
  height: 120,
});
this.view.addChild(header);
```

## 3. Bottom bar with portrait override

```ts
const footer = new LayoutContainer({
  x: 30,
  y: "sh - 80",
  width: "sw - 60",
  height: 60,
  portrait: {
    y: "sh - 120",
    height: 100,
  },
});
this.view.addChild(footer);
```

Portrait keys overlay the landscape values when `Engine.layout.isPortrait` is true. Everything not overridden stays as declared.

## 4. Attaching a PixiJS child via `view`

A `LayoutContainer` can wrap an existing `Container` — `width` / `height` are forwarded to it, so the child resizes automatically.

```ts
import { Sprite } from "pixi.js";

const logoSprite = Sprite.from("logo.png");

const logoBox = new LayoutContainer({
  x: "sw/2 - 100",
  y: 40,
  width: 200,
  height: 80,
  view: logoSprite,
});
this.view.addChild(logoBox);
```

## 5. `onResize` for custom logic

```ts
import { Text } from "pixi.js";

const title = new Text({ text: "HELLO", style: { fill: 0xffffff, fontSize: 48 } });

const titleBox = new LayoutContainer({
  x: "sw/2",
  y: 80,
  view: title,
  onResize: ({ vars }) => {
    title.style.fontSize = vars.sw < 800 ? 32 : 48;
    title.anchor.set(0.5, 0);
  },
});
this.view.addChild(titleBox);
```

`vars` carries the live `sw / sh / smax / gx / gy / gw / gh` values.

## 6. Responding to layout from a `System.resize()`

Non-`LayoutContainer` children don't auto-update — reposition them in `resize()`.

```ts
import { System } from "@falkura-pet/game-base";
import { Engine } from "@falkura-pet/engine";
import { Graphics } from "pixi.js";

export class BackgroundSystem extends System {
  static MODULE_ID = "bg";

  private bg!: Graphics;

  override start(): void {
    this.bg = new Graphics();
    this.view.addChild(this.bg);
    this.redraw();
  }

  override resize(): void {
    this.redraw();
  }

  private redraw() {
    const { width, height } = Engine.layout.screen;
    this.bg.clear().rect(0, 0, width, height).fill(0x111111);
  }
}
```

## 7. Expressions that reference the game rect

Use `gx/gy/gw/gh` when content must stay inside the designed play area regardless of aspect ratio.

```ts
const board = new LayoutContainer({
  x: "gx + gw/2",         // horizontal center of the game rect
  y: "gy + gh/2",
  width: "gw * 0.8",
  height: "gh * 0.8",
});
this.view.addChild(board);
```

Compare to `"sw/2"` / `"sh/2"`, which centers on the full viewport (including letterbox/pillarbox areas).

## 8. Flex-like horizontal row

There's no flexbox — compose rows with explicit math.

```ts
const makeButton = (label: string, index: number, total: number) => {
  const w = 180, gap = 20;
  const rowWidth = total * w + (total - 1) * gap;
  return new LayoutContainer({
    x: `sw/2 - ${rowWidth / 2} + ${index * (w + gap)}`,
    y: "sh - 100",
    width: w,
    height: 60,
    portrait: { y: `sh - ${100 + index * 80}` },  // stack vertically in portrait
  });
};
```

## 9. Reading `isPortrait` directly

```ts
override resize(): void {
  const { width, height } = Engine.layout.screen;
  const isPortrait = Engine.layout.isPortrait;
  this.hud.style.fontSize = isPortrait ? 24 : 16;
  this.hud.style.wordWrapWidth = Math.max(200, width - 60);
}
```

## Gotchas

- **Pivot for centered boxes.** `x: "sw/2"` places the **origin** at the screen center. If you want the element's center there, set `pivot` to half its size.
- **Don't nest huge expressions** — prefer doing the math in `onResize` for anything complex. Expressions are parsed each resize.
- **Child `Container`s aren't re-evaluated** — only `LayoutContainer`s are. Raw `Container`/`Graphics` children stay at whatever coordinates you gave them; update them in `System.resize()`.
- **Portrait config is a partial overlay** — you don't need to repeat unchanged keys.
