/**
 * Central tuning file. All magic numbers live here; gameplay code imports
 * from this module instead of hardcoding values.
 */

export const PHYSICS = {
  /** Gravitational constant — higher = stronger pull for a given mass. */
  G: 120,
  /**
   * Plummer softening length. Gravity magnitude is `G·m / (r² + s²)` instead
   * of `G·m / r²`, so acceleration plateaus smoothly near r=0 instead of
   * spiking. Larger values make planets feel "softer" and easier to escape.
   */
  GRAVITY_SOFTEN: 770,
  /** Maximum ship speed (pixels per physics tick at 60 Hz). */
  MAX_SPEED: 18,
  /** Drag displacement is clamped to this length in pixels. */
  MAX_DRAG_DISTANCE: 280,
  /** Drag distance is multiplied by this to become initial velocity. */
  DRAG_IMPULSE_SCALE: 0.08,
  /** Ship physical radius. */
  SHIP_RADIUS: 12,
};

/**
 * Smooth time scaling while the player is aiming (dragging).
 * Set `TRANSITION_MS` to 0 to disable the smooth ramp — speed flips instantly.
 */
export const AIM_TIME = {
  /** Ticker speed multiplier while aiming (1 = normal, 0.25 = quarter speed). */
  SPEED: 0.15,
  /** Transition duration in ms from normal to aim speed (and back). */
  TRANSITION_MS: 280,
};

export const LEVEL = {
  TOTAL: 10,
  /** Safe-area inset from the screen edges (fraction of `min(w, h)`). */
  SAFE_MARGIN_PCT: 0.05,
  NAMES: [
    "First Light",
    "Twin Suns",
    "Asteroid Belt",
    "The Corridor",
    "Hunter's Orbit",
    "Crossfire",
    "Black Sites",
    "Gravity Well",
    "Maelstrom",
    "Event Horizon",
  ],
};

export const PLANET_COLORS = [
  0xff6b6b, 0x4dabf7, 0xffd43b, 0xa29bfe, 0x55efc4, 0xfd79a8, 0xffa94d,
];

/** Counts per level + per-entity scaling. Used by the level generator. */
export const GENERATION = {
  PLANET: {
    MIN_MASS: 400,
    MAX_MASS: 1300,
    RADIUS_FACTOR: 1.22,
    MAX: 5,
    SAFE_PAD: 80,
    SPAWN_ATTEMPTS: 80,
  },
  ORB: {
    BASE: 3,
    STEP: 5,
    SAFE_PAD: 30,
    SPAWN_ATTEMPTS: 80,
  },
  WALL: {
    MIN_LEN: 140,
    MAX_LEN: 260,
    MAX: 3,
    START_LEVEL: 3,
    SAFE_PAD: 40,
    SPAWN_ATTEMPTS: 40,
  },
  CHASER: {
    SPEED_BASE: 1.1,
    SPEED_STEP: 0.06,
    MAX: 3,
    START_LEVEL: 4,
    SAFE_PAD: 80,
    SPAWN_ATTEMPTS: 60,
  },
  SHOOTER: {
    COOLDOWN_BASE: 180,
    COOLDOWN_STEP: 8,
    COOLDOWN_MIN: 80,
    SPEED_BASE: 3.4,
    SPEED_STEP: 0.08,
    MAX: 2,
    START_LEVEL: 6,
    SAFE_PAD: 60,
    SPAWN_ATTEMPTS: 60,
  },
  GRAVITY_SHOOTER: {
    COOLDOWN_BASE: 240,
    COOLDOWN_STEP: 6,
    COOLDOWN_MIN: 120,
    SPEED_BASE: 2.6,
    SPEED_STEP: 0.05,
    MAX: 2,
    START_LEVEL: 8,
    SAFE_PAD: 60,
    SPAWN_ATTEMPTS: 60,
  },
  SHIP_SAFE_PAD: 60,
  SHIP_SPAWN_ATTEMPTS: 120,
};

export const PROJECTILE = {
  RADIUS: 5,
  LIFE_FRAMES: 420,
  OFFSCREEN_MARGIN: 200,
};

export const SHIP_BOUNDS_MARGIN = 500;

export const TRAJECTORY_PREVIEW = {
  STEPS: 220,
  DASH_EVERY: 3,
  COLOR: 0xffd43b,
  ALPHA: 0.75,
  WIDTH: 2,
};

export const STARFIELD = {
  BACKGROUND_COLOR: 0x050816,
  BASE_DENSITY: 0.000055,
  MIN_STARS: 90,
  MAX_STARS: 220,
  BIG_STAR_RATIO: 0.14,
  GIANT_STAR_RATIO: 0.04,
  PARALLAX_ALPHA: 0.45,
};

/** Overlay buttons (retry / next). Sized for touch. */
export const OVERLAY_BUTTON = {
  WIDTH: 520,
  HEIGHT: 140,
  RADIUS: 18,
  FONT_SIZE: 42,
  GAP: 40,
  PORTRAIT_STEP: 170,
};
