import { Engine } from "@falkura-pet/engine";
import { Graphics, Rectangle, Texture } from "pixi.js";

const cache = new Map<string, Texture>();

/**
 * Bake a one-time Graphics draw into a Sprite-ready Texture.
 *
 * Pass a `halfExtent` when the art is drawn around (0,0) and rotation center
 * must stay on the origin — anchor(0.5) then lands exactly on (0,0). Without
 * it, pixi's auto-bounds can shift the anchor by a pixel or two and rotations
 * visibly wobble.
 */
export function bakeTexture(
  key: string,
  build: () => Graphics,
  halfExtent?: number,
): Texture {
  const cached = cache.get(key);
  if (cached) return cached;
  const g = build();
  const tex = Engine.app.renderer.generateTexture({
    target: g,
    resolution: Math.max(1, Engine.app.renderer.resolution),
    antialias: true,
    frame:
      halfExtent !== undefined
        ? new Rectangle(-halfExtent, -halfExtent, halfExtent * 2, halfExtent * 2)
        : undefined,
  });
  g.destroy();
  cache.set(key, tex);
  return tex;
}

export function clearTextureCache() {
  for (const tex of cache.values()) tex.destroy(true);
  cache.clear();
}
