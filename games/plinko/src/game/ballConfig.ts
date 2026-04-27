export const BALL_CONFIG = {
  color: "#FF1D45",

  /** Max simultaneous balls on the board before drop requests are ignored. */
  maxActiveBalls: 100,

  /**
   * Simulated gravity in px/s². Applied to the actual pixel distances between
   * waypoints to derive realistic hop durations — no fixed timings.
   */
  gravity: 2800,

  /**
   * Coefficient of restitution: fraction of vertical speed retained after
   * bouncing off a peg. Controls how high the ball bounces back up.
   */
  restitution: 0.52,

  /**
   * Horizontal speed multiplier applied to the lateral distance per hop.
   * Higher = ball moves sideways more decisively (less drift).
   */
  lateralSpeedFactor: 1.6,

  /**
   * Random lateral overshoot fraction of colSpacingX.
   * Gives each bounce a unique angle.
   */
  wobbleFraction: 0.18,

  /** Squash/stretch on peg hit. */
  squashX: 1.15,
  squashY: 0.82,
  squashDuration: 0.04,
  stretchDuration: 0.09,

  /** Alpha fade after landing. */
  fadeDuration: 0.18,
  fadeDelay: 0.05,

  /** Milliseconds between autoplay drops. */
  autoplayIntervalMs: 400,
};
