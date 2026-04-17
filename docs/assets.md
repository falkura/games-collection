# Assets

Each game has its own `assets/` folder. AssetPack processes it at build time into `dist/assets/` with atlases, compressed PNG/JPG/WEBP, mipmaps, cache-busted hashes, and a PixiJS manifest. PixiJS `Assets` serves everything at runtime.

## Where files go

```
games/<name>/assets/
  game.json              ← required, consumed by the wrapper card
  icon.png               ← required, game picker icon
  sprites/player.png
  levels/level1.json
  audio/hit.mp3
  ui/logo.png
```

Anything you drop into `assets/` ends up in the built bundle.

## Accessing at runtime

`Engine.loadAssets()` loads the manifest bundle during the boot sequence, so by the time `initGame()` runs everything is cached. Read with PixiJS `Assets.get(key)`:

```ts
import { Assets } from "pixi.js";

const playerTex = Assets.get("sprites/player.png");
const level1 = Assets.get("levels/level1.json");
const logo = Assets.get("ui/logo.png");
```

**Keys are paths relative to the `assets/` folder.** No leading slash, no `./`, no `assets/` prefix.

| File on disk | `Assets.get(...)` key |
| --- | --- |
| `games/<name>/assets/config.json` | `"config.json"` |
| `games/<name>/assets/levels/level1.json` | `"levels/level1.json"` |
| `games/<name>/assets/ui/button.png` | `"ui/button.png"` |

### Shortcut aliases

AssetPack also registers shorter aliases for every file. All of these resolve to the same asset:

```ts
Assets.get("levels/level1.json");
Assets.get("levels/level1");
Assets.get("level1.json");
Assets.get("level1");
```

The longest form (full path + extension) is unambiguous and safest across renames — prefer it.

## Atlases and spritesheets

Images in directories matching the AssetPack config get packed into atlases automatically. You still access individual frames by their original relative path — the atlas is transparent to game code:

```ts
const sword = Assets.get("items/sword.png");  // served from atlas at runtime
```

## JSON is pre-parsed

JSON files come back as parsed objects, not strings:

```ts
const level = Assets.get<LevelData>("levels/level1.json");
console.log(level.ship.x);
```

Type-cast with a generic on `Assets.get<T>` to get autocompletion.

## Dev mode

`moon run <name>:dev` serves from an in-memory asset pipeline — edits to files under `assets/` hot-reload just like code edits.

## The manifest

AssetPack writes `manifest.json` alongside `dist/assets/`. The engine's `loadAssets()` reads it and calls `Assets.addBundle(...)` with the first bundle. You generally don't need to touch the manifest, but if something isn't loading, open it and verify the key and alias list.

## `game.json` and `icon.png`

These two have special roles — the wrapper scans `games/*/assets/game.json` and copies `games/*/assets/icon.png` during `bun run assemble`:

- `game.json.title` — shown on the launcher card.
- `game.json.description` — shown on the launcher card. Describe what the **player** does, not the implementation.
- `game.json.version` — shown on the launcher card.
- `icon.png` — square icon for the launcher card.

A placeholder description ships with the template — replace it before the first build.

## Shared assets

The engine package intentionally **holds no runtime assets** other than a few SVG UI icons. Don't move game-specific assets up into `packages/`.
