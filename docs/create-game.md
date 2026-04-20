# Creating a new game

To create new game follow this steps:

## 1. Generate game

```bash
moon generate game -- --name '<Human Readable Name>'
bun install
```

This creates `games/<slug>/` from the template in `templates/` and wires it into the Moon workspace.

## 2. Replace the placeholders

Two placeholders ship with the template and must be replaced before the game is shown:

- `games/<name>/README.md` — the `_Add a description..._` line.
- `games/<name>/assets/game.json` — the `description` field. This string is rendered on the launcher card in the wrapper, so describe what the **player** does, not how the code works.

## 3. Implement the game

See [game.md](./game.md) for the game implementation instructions.

## 4. Verify

Before calling it done:

- `moon run <name>:build` succeeds with zero TypeScript errors.
