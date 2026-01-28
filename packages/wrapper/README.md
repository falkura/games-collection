# Wrapper

The wrapper acts as a launcher and container for all games. It provides the start screen, handles game selection, and assembles the final production build.

> This package is part of the [games collection][root-readme] project

## Overview

The wrapper is responsible for:

- Serving as the application **entry** page
- Providing a game selection/start screen
- Integrating built games into a single distributable app

*AssetPack is available for this package. [More information here][assetpack-readme].*

## Build Output Structure

During build, the wrapper assembles the full project into the final `./dist/` directory at the root of monorepo.

The structure looks like this:

```sh
dist/
│
├── index.html              # Wrapper entry page
├── index.js                # Wrapper application bundle
├── assets/                 # Wrapper static assets (from AssetPack)
│   └── ...
│
├── engine/                 # Compiled engine package
│   └── ...
│
├── game-1/                 # Built game
│   ├── assets/             # Game-specific assets
│   │   └── ...
│   └── ...                 # Game bundle and files
│
├── game-1/                 # Built game
│   ├── assets/             # Game-specific assets
│   │   └── ...
│   └── ...                 # Game bundle and files
│
└── ...
```

### What happens during build

- The **wrapper bundle** is built into `dist/`
- Wrapper **assets** are placed into `dist/assets/`
- The **engine package** is copied into `dist/engine/`
- Each game is built and copied into its own folder:
  `dist/<game-name>/`

This structure allows games to remain **independent**, while still being launched from a single unified application.

## Development

To work on the wrapper, run the dev script from the monorepo root:

```sh
bun run dev:wrapper
```

Any changes to the engine will be picked up automatically.

## Additional Information

- Wrapper code should remain game-agnostic
- Game logic and content should never be added to this package
- More bundling information check in [**shared** readme][shared-readme-wrapper]

--- 

For more information, see the [**monorepo root README**][root-readme].

[root-readme]: ../../README.md
[normalize-url]: https://github.com/necolas/normalize.css/
[assetpack-readme]: ../shared/README.md#assetpack
[shared-readme-wrapper]: ../../packages/shared/README.md#wrapper