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

  /** Alpha fade after landing. */
  fadeDuration: 0.18,

  /** Milliseconds between autoplay drops. */
  autoplayIntervalMs: 400,

  /** GSAP timeline timeScale when turbo is active. Also used to shorten the autoplay interval. */
  turboTimeScale: 2,

  /**
   * Per-hop speed variance: each hop's launch speed is scaled by a random
   * factor in [1 - speedVariance, 1 + speedVariance].
   */
  speedVariance: 0.35,

  /**
   * Probability that a hop gets an extra upward energy boost (high bounce).
   * When triggered, vyImpact is multiplied by boostMultiplier.
   */
  highBoostChance: 0.18,
  highBoostMultiplier: 1.55,

  /**
   * Probability that a ball skips a peg entirely (flies over it) when there
   * are at least skipMinRowsLeft rows remaining and the ball hasn't just skipped.
   * The skipped peg's waypoint is dropped; the ball arcs directly to the next.
   */
  skipChance: 0.22,
  skipMinRowsLeft: 3,
};
