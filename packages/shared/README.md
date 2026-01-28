<a id="readme-top"></a>
# Shared

This package contains **shared configuration, tooling, and resources** used across the entire monorepo.

It centralizes common setup to ensure consistency between games, wrappers, and the engine, and to reduce duplication across packages.

> This package is part of the [games collection][root-readme] project

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#assetpack">AssetPack</a></li>
    <li><a href="#rspack">RSPack</a></li>
    <li><a href="#tsconfig">TSConfig</a></li>
    <li><a href="#html">HTML</a></li>
    <li><a href="#types">Types</a></li>
    <li><a href="#normalize">Normalize</a></li>
    <li><a href="#github">GitHub</a></li>
  </ol>
</details>


## AssetPack

[**AssetPack**][assetpack-url] configuration used for bundling and optimizing assets for games and wrapper.

This includes:

- Compression of all image formats to reduse assets size
- Bundling images in atlases to make assets loading faster
- Generating manifest file with all the assets for universal loading
- Cache busting to prevent asset update issues caused by browser caching
- WEBP images generation for high quality and small assets weight
- Mip map images generation for scaled version of assets
- JSON optimizatoin

There is no config for engine, because it should not have any assets.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## RSPack

[**RSPack**][rspack-url] configuration used for building and developing games and wrapper and [**RSLib**][rslib-url] config for engine.

<a id="rspack-games"></a>

### Games

There is many parts involved in creating game build:

- JS bundle by RSPack without engine dependency (!)
- Engine bundle that loads as an external script
- HTML file with game data and script tags
- Assets that are bundled and added by the assetpack

> [!IMPORTANT]
> The engine should be loaded as an external script so it is fetched and cached by the browser on first load. When another game is opened, only the game-specific code needs to be loaded, as the engine script will be served from the cache.

Although almost all the assets are managed by assetpack, RSPack is responsible for loading and optimizing css files using LightningCSS.

> [!NOTE]
> The *engine as an external module* approach applies only to **production builds**.
> During **development**, engine dependency management is handled by Rspack.

<a id="rspack-wrapper"></a>

### Wrapper

Wrapper build is a final build of application. Output folder is the root folder of the project, so all the files are placed here. That includes:

- All the games with assets
- Engine's bundle in UMD format
- JS bundle of wrapper bundled by RSPack without engine dependency (same as for the games)
- @gamesMeta - special module, consists of JSON file with information about all loaded games
- Wrapper assets from assetpack
- Main application HTML page

Development build is much simplier, because right now it's not possible to develop wrapper AND games simultaneously.

<a id="rspack-engine"></a>

### Engine

The **production build** is a [UMD module][rslib-umd-url], allowing the bundle to run in browser globals. This ensures the engine is loaded only **once** for a wrapper or any game, then cached and reused when opening another game.

The **development build** uses a more classic approach - [ESM module][rslib-esm-url] that is integrated in game or wrapper development bundle.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Other

### TSConfig

Contains shared **TypeScript configuration files**. It also enables [types](#types) for each subproject.

### HTML

Provides the **HTML template** used by game projects ~~and wrapper~~.

### Types

Contains **shared TypeScript typings**.

### Normalize

Contains [**normalize.css**][normalize-url] styles. Used to ensure consistent default styling behavior across browsers for all games and wrapper.

### GitHub

Contains **GitHub-related files**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

--- 

For more information, see the [**monorepo root README**][root-readme].

[root-readme]: ../../README.md
[normalize-url]: https://github.com/necolas/normalize.css/
[assetpack-url]: https://pixijs.io/assetpack/
[rspack-url]: https://rspack.rs/
[rslib-url]: https://rslib.rs/
[rslib-umd-url]: https://rslib.rs/guide/basic/output-format#umd
[rslib-esm-url]: https://rslib.rs/guide/basic/output-format#esm--cjs
