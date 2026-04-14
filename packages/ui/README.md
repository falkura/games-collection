# UI

Scene management and layout system for games. Implements the [`UIInstance`](../engine/README.md) interface defined by the engine.

> Part of the [Games Collection](../../README.md) monorepo

## Usage example

```ts
// Custom scene
class MyScene extends AppScreen {
  static MODULE_ID = "Menu";

  override onInit(): void {}
  override onMount(): void {}
  override onTick(ticker: Ticker): void {}
}

// Custom UI with extra scenes
class MyUI extends UI {
  override createGameScenes() {
    return { ...super.createGameScenes(), Menu: MyScene };
  }
}
```

## Details

`UI` implements `UIInstance` and manages the display tree, scenes, and layout. It accepts landscape and portrait size configs at construction and derives responsive layout bounds from them.

Lifecycle hooks: `onInit` (called once on registration), `onMount` / `onUnmount` (called on scene switch), `onTick` (called every frame while active). Two built-in scenes are always registered: `GameScene` (mounts the game view container) and `LoadScene` (fullscreen loading).

`ScenesController` manages registered scenes using `ModuleManager`. Only one scene is active at a time — switching removes the previous scene from the display tree and ticker, then adds the new one.

`LayoutManager` is a singleton that tracks screen dimensions and orientation (portrait/landscape). On resize it recalculates bounds and walks the entire display tree.

`LayoutContainer` extends PixiJS `Container` with a reactive `layout` config. Supported properties: `x`, `y`, `width`, `height`, `zIndex`, `onResize`, `view`, `portrait`. Values can be numbers or math expression strings using special layout variables: `gx`/`gy`/`gw`/`gh` (game bounds), `sw`/`sh`/`smax` (screen size). Landscape and portrait configs are merged automatically — portrait overrides landscape when in portrait orientation.
