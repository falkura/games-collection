# Shared

Centralized configs, scripts, and tooling for the entire monorepo.

> Part of the [Games Collection](../../README.md) monorepo

```bash
shared/
  rspack/       # Rspack configs for games and wrapper; Rslib config for libraries
  tsconfig/     # TypeScript configs for engine, games, wrapper, and packages
  assetpack/    # AssetPack pipeline configs for games and wrapper
  scripts/      # Build-time scripts — gamesMeta generation, icon copying
  schemas/      # JSON schemas for game.json and wrapper.json
  types/        # Global TypeScript declarations (__DEV__, root, canvas)
  html/         # HTML template for game pages
  normalize/    # normalize.css for cross-browser consistency
  paths.ts      # Shared monorepo path constants (root, games, build)
  github/       # Images used in GitHub READMEs
```

## Details

### AssetPack

[AssetPack](https://pixijs.io/assetpack/) pipeline shared between games and wrapper. Each run: packs textures into atlases, generates mipmaps, compresses to PNG/JPG/WEBP, busts cache hashes, and outputs a PixiJS manifest file. Games output to `dist/assets/`, wrapper outputs to `build/assets/`. No config for the engine — it must not contain assets.

### Rspack

[Rspack](https://rspack.rs/) and [Rslib](https://rslib.rs/) configs for all builds. Base config sets up SWC for TypeScript, LightningCSS for styles, and SVG as source assets. Targets modern browsers (Chrome 87+, Firefox 78+, Safari 14+).

**Games** — extends base config, bundles `src/index.ts` into `dist/`, injects `game.json` title into the HTML template, serves on port 3000 in dev.

**Wrapper** — extends base config, runs `generateGamesMeta` and `copyGameIcons` scripts before bundling, resolves `@gamesMeta` alias to the generated `meta.json`, copies all game `dist/` folders and public assets into `build/`, serves on port 3001 in dev.

**Libraries** (engine, game-base, ui) — Rslib config, ESM format, unbundled, emits `.d.ts` declarations, no minification (library consumer's responsibility).

### Scripts

**`gamesMeta.ts`** — scans `games/` directory, reads each `game.json`, filters disabled games, and writes a combined `meta.json` used as the `@gamesMeta` module in the wrapper build.

**`copyGameIcons.ts`** — reads icon paths from `meta.json` and copies each game's icon into `packages/wrapper/public/icons/`.

### Schemas

JSON schemas for `game.json` and `wrapper.json`. Used for editor validation.

### TSConfig

Four configs: `game` (strict mode), `engine` (relaxed — no strict null checks, no implicit any), `wrapper`, and `package` (for library packages). All include the shared `global.d.ts` types.

### Types

`global.d.ts` declares globals available in all subprojects: `__DEV__` (boolean), `root` (div), `canvas` (canvas element).
