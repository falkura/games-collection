<a id="readme-top"></a>
<div align="center">
  <h1 align="center">Games Collection</h1>

  <p align="center">
    A monorepo for building games on a shared engine and wrapper.
    <br />
    Focused on clean architecture, fast builds, and easy game creation.
    <br />
    <br />
    <a href="#getting-started"><strong>Get Started »</strong></a>

</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#project-goals">Project Goals</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


## About The Project

**games-collection** is a project for developing, building, and running small games, along with a shared game engine and a wrapper application that ties everything together. It focuses on clear build pipelines and simple, reliable asset management.

### Project Goals

- Make game creation easy and intuitive, with minimal manual work at every stage of development
- Keep the engine versatile, scalable, and as simple as possible
- Build a strong monorepo architecture that is easy to navigate and maintain
- Reduce carbon emissions by relying on fast modern bundlers and efficient caching


### Built With

<!-- - **PixiJS** – graphics rendering
- **Rspack** – bundling
- **Bun** – package manager and script runner
- **Turbo** – monorepo/workspace management
- **AssetPack** – asset bundling and management
- **Yoga** – layout management
- **GSAP** – animations -->

<p align="left" style="margin-left: 25;">
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://pixijs.com/">
  <img src="./packages/shared/github/images/pixijs.svg" height="20" />
  <span><strong>PixiJS</strong> - graphics rendering</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://rspack.rs/">
  <img src="./packages/shared/github/images/rspack.svg" height="25" />
  <span><strong>Rspack</strong> - bundling</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://bun.com/">
  <img src="./packages/shared/github/images/bun.svg" height="25" />
  <span><strong>Bun</strong> - package manager and script runner</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://turborepo.dev/">
  <img src="./packages/shared/github/images/turborepo.svg" height="24" />
  <span><strong>Turbo</strong> - monorepo/workspace management</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://pixijs.io/assetpack/">
  <img src="./packages/shared/github/images/assetpack.svg" height="23" />
  <span><strong>AssetPack</strong> - asset bundling and management</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://www.yogalayout.dev/">
  <img src="./packages/shared/github/images/yoga.svg" height="32" />
  <span><strong>Yoga</strong> - layout management</span>
</a>
<br/>
<a style="display: inline-flex; align-items: center; gap: 8px;" href="https://gsap.com/">
  <img src="./packages/shared/github/images/gsap.svg" height="18" />
  <span><strong>GSAP</strong> - animations</span>
</a>
</p>


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

To run this project you must have [**Bun**][bun-url] installed.

### Project Installation

```sh
# Clone the repository
git clone https://github.com/falkura/games-collection.git

# Open the respository
cd ./games-collection

# Install dependencies
bun install
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Available scripts:

- **build**
  Builds the engine, wrapper, and all added games

- **dev**
  Runs development mode for a selected game. Game select is available in CLI prompt.

- **dev:wrapper**:
  Runs development mode for the wrapper and engine

* **serve**:
  Serves the built project from the `dist` folder

To execute script run:

```md
bun run <script-name>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Architecture

```sh
/packages/
├─ wrapper/   # Main application and game picker
├─ engine/    # Core engine and UI for games
├─ shared/    # Shared configs, tools and utilities
└─ schemas/   # JSON schemas

/scripts/
├─ build.ts        # Build engine, wrapper, and games
├─ dev.ts          # Develop a specific game
└─ dev_wrapper.ts  # Develop the wrapper

/games/
└─ <game-name>/    # Individual games
```

- **Wrapper**: Main entry point where games are selected
- **Engine**: Shared runtime and UI layout
- **Games**: Independent game modules
- **Scripts**: Custom logic for builds and development

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

* [ ] Game template generator
* [ ] Documentation per package
* [ ] Scripts args description
* [ ] Fill roadmap...

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Contributing

This is a personal pet project and is not currently accepting contributions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

License is **TBD**. Until a license is added, all rights are reserved by the author.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


[bun-url]: https://bun.com/
