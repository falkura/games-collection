# Wrapper

Launcher and container for all games. Provides a game selection screen and assembles the final production build into a single deployable bundle.

> Part of the [Games Collection](../../README.md) monorepo

### Development

```bash
moon run games-wrapper:dev    # http://localhost:3001
```

### Build

```bash
bun run assemble      # assembles application into root/build
```

## Details

The wrapper is the application entry point. It renders a game picker with cards for each game (icon, title, version, description) and navigates to individual games via the engine's event system.

During build, everything is assembled into `/build`: wrapper bundle, engine output, per-game bundles with assets, and a generated `@gamesMeta` module that provides the wrapper with metadata about all available games at build time.
