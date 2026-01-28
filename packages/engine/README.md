# Engine

This repository contains the **core game engine** used across in games and a wrapper.

The engine is built around **PixiJS** and PixiJS libraries and is responsible for everything except game-specific logic.

> This package is part of the [games collection][root-readme] project

## Overview

The engine handles:

- Rendering via **PixiJS**
- UI layout using [**@pixi/layout**](https://layout.pixijs.io/) (Yoga-powered)
- Animations via **GSAP**
- Game loop and lifecycle management
- Asset loading and management
- Input and interactions handling
- Save / load of game data

## Architecture

- The engine is a **monorepo package**
- It must not contain any assets
- It is designed to be consumed by games and wrappers in the monorepo
- All build and development steps are **fully automated**

> [!IMPORTANT]
> Although the engine can be built and developed like a standalone package, it is a part of the monorepo.
> You do not need to run any scripts from this package directly.
> To develop or test the engine, run a **game or wrapper** from the monorepo root.

## Development

To develop the engine run any game from the monorepo root. Any changes made to the engine will be picked up automatically.

## Assets

The engine **must not include any assets**.

All assets belong to individual games, or wrappers. This ensures the engine remains generic, lightweight, and reusable.

> [!NOTE]
> Only SVG files are allowed to be used as icons for the UI elements.


## Additional Information

- Engine code should remain game-agnostic
- Shared systems and utilities should live here
- Game logic and content should never be added to this package
- For bundling information check [**shared** readme][shared-readme-engine]

---

For more information, see the [**monorepo root README**][root-readme].

[root-readme]: ../../README.md
[shared-readme-engine]: ../shared/README.md#engine