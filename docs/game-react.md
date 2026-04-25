# Building a React-UI Game

For games scaffolded from `templates/game-react`. Read [`game.md`](./game.md) first — engine, systems, and lifecycle work the same. This doc covers only the React layer.

## What you get

PixiJS owns the canvas (gameplay, animation). React owns the DOM overlay (menus, HUD, modals) mounted into a global `<div id="uiRoot">` that sits above the canvas. The two communicate through plain modules — there is no Pixi-React bridge.

```
src/
  <Name>.ts            # GameController — registers systems, drives gameplay
  index.ts             # boot: Engine.init → Engine.startGame → mountUI
  systems/MainSystem.ts
  ui/
    index.tsx          # mountUI()
    App.tsx            # React root component
    theme.css          # design tokens + base UI styles
```

## Communication: events vs state

Pick the right tool per direction:

- **Commands (UI → game, or game → UI) — use a Pixi `EventEmitter`.** Verbs like `StartRequested`, `ColumnSelected`, `RestartRequested`. They fire and forget. Define them in `src/events.ts`:

  ```ts
  import { EventEmitter } from "pixi.js";

  export enum Events { StartRequested, ColumnSelected }
  interface EventTypes {
    [Events.StartRequested]: { mode: "ai" | "pvp" };
    [Events.ColumnSelected]: { col: number };
  }
  export const events = new EventEmitter<EventTypes>();
  ```

- **Observable state (game → UI) — use a tiny store with `useSyncExternalStore`.** Things like "whose turn is it", "what screen are we on", "who won". Don't push these as events — late subscribers miss them.

  ```ts
  // src/state.ts
  let state = { screen: "menu", winner: 0 };
  const listeners = new Set<() => void>();
  export const gameState = {
    get: () => state,
    set: (patch) => { state = { ...state, ...patch }; listeners.forEach(l => l()); },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
  ```

  In `App.tsx`: `const state = useSyncExternalStore(gameState.subscribe, gameState.get)`.

The game writes via `gameState.set(...)`. React reads. No race on first mount, no missed values.

## Listener `this` binding

`init()` runs from the `GameController` constructor — **before** subclass arrow-function field initializers exist. Use regular methods and pass `this` as the third arg:

```ts
override init(): void {
  events.on(Events.StartRequested, this.onStart, this);
}
private onStart({ mode }: { mode: "ai" | "pvp" }) { /* ... */ }
```

## Tweakpane reservation

The Tweakpane debug panel is fixed to the top-right. The shared HTML template defines `--tweakpane-reserved` (CSS var). Any DOM UI anchored to the top-right must shift left:

```css
.hud { padding-right: calc(20px + var(--tweakpane-reserved)); }
```

## Theme

`ui/theme.css` ships with sensible default tokens (`--c-bg`, `--c-panel`, `--c-accent*`, radii, shadow, system-font stack). **Edit the tokens to match the game's vibe** — change palette, swap the font, tighten the radii. The placeholder values are intentionally generic.

## Conventions

- Co-locate components: `ui/components/Foo/Foo.tsx` + `Foo.css`. Import the CSS at the top of the TSX.
- Keep React state in the store, not in component state, when the game needs to read or write it. Component-local state is fine for purely visual things (input focus, hover).
- Don't try to render gameplay through React. If something needs to animate at frame rate, it belongs in a Pixi system.
