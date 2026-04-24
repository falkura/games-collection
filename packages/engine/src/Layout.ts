import { isMobile, Size } from "pixi.js";

/**
 * Tracks screen dimensions and the uniform fit-scale used to map virtual
 * game pixels to physical pixels. Updated on every renderer resize by the engine.
 *
 * Use {@link screen} for full-viewport positioning (backgrounds, edge HUDs)
 * and {@link game} for gameplay content that must stay within the design rect.
 */
class LayoutClass {
  private _w = 0;
  private _h = 0;
  private _scaleFit = 1;

  private TARGET_LANDSCAPE = { width: 1920, height: 1080 };
  private TARGET_PORTRAIT = { width: 1080, height: 1920 };

  private get _target(): { width: number; height: number } {
    return this.isPortrait ? this.TARGET_PORTRAIT : this.TARGET_LANDSCAPE;
  }

  /** @internal Set virtual target dimensions. Called once by the engine during init. */
  public updateTargetDimensions(sizeLandscape: Size, sizePortrait: Size) {
    this.TARGET_LANDSCAPE = sizeLandscape;
    this.TARGET_PORTRAIT = sizePortrait;
  }

  /** @internal Recalculate the fit-scale from new physical dimensions. Called by the engine on resize. */
  public resize(width: number, height: number, resolution: number) {
    this._w = width;
    this._h = height;

    const { width: tw, height: th } = this._target;
    this._scaleFit = Math.min(this._w / tw, this._h / th);
  }

  /** Horizontal offset of the game rect inside the screen (letterbox inset). */
  get gameX(): number {
    return (this.screenWidth - this.gameWidth) / 2;
  }

  /** Vertical offset of the game rect inside the screen (letterbox inset). */
  get gameY(): number {
    return (this.screenHeight - this.gameHeight) / 2;
  }

  /** Design-resolution width in virtual pixels (e.g. `1920` in landscape). */
  get gameWidth(): number {
    return this._target.width;
  }

  /** Design-resolution height in virtual pixels (e.g. `1080` in landscape). */
  get gameHeight(): number {
    return this._target.height;
  }

  /** Full viewport width in virtual pixels. Always ≥ `gameWidth`. */
  get screenWidth(): number {
    return this._w / this._scaleFit;
  }

  /** Full viewport height in virtual pixels. Always ≥ `gameHeight`. */
  get screenHeight(): number {
    return this._h / this._scaleFit;
  }

  /** `true` when the screen is taller than it is wide. */
  get isPortrait(): boolean {
    return this._h > this._w;
  }

  /** `true` on mobile devices. */
  get isMobile(): boolean {
    return isMobile.any;
  }

  /** Larger of `screenWidth` and `screenHeight`. */
  get screenMax(): number {
    return Math.max(this.screenWidth, this.screenHeight);
  }

  /** Smaller of `screenWidth` and `screenHeight`. */
  get screenMin(): number {
    return Math.min(this.screenWidth, this.screenHeight);
  }

  /** Uniform fit-scale applied to the stage root. */
  get scale(): number {
    return this._scaleFit;
  }

  /** Full-viewport bounds helper. Use for backgrounds and edge-anchored HUDs. */
  screen = new LayoutScreenHelper(this);

  /** Design-rect bounds helper. Use for gameplay content within the fixed resolution. */
  game = new LayoutGameHelper(this);
}

/** Position helpers for the full screen rectangle, in virtual pixels. Access via `Layout.screen`. */
class LayoutScreenHelper {
  constructor(protected layout: LayoutClass) {}

  get x() {
    return 0;
  }

  get y() {
    return 0;
  }

  get width() {
    return this.layout.screenWidth;
  }

  get height() {
    return this.layout.screenHeight;
  }

  /** Center point of this rect. */
  get center() {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  /** Y coordinate `value` px from the top edge. */
  fromTop(value = 0) {
    return this.y + value;
  }

  /** Y coordinate `value` px from the bottom edge. */
  fromBottom(value = 0) {
    return this.y + this.height - value;
  }

  /** X coordinate `value` px from the left edge. */
  fromLeft(value = 0) {
    return this.x + value;
  }

  /** X coordinate `value` px from the right edge. */
  fromRight(value = 0) {
    return this.x + this.width - value;
  }
}

/** Position helpers for the design-resolution game rect. Access via `Layout.game`. */
class LayoutGameHelper extends LayoutScreenHelper {
  get x() {
    return this.layout.gameX;
  }

  get y() {
    return this.layout.gameY;
  }

  get width() {
    return this.layout.gameWidth;
  }

  get height() {
    return this.layout.gameHeight;
  }
}

export const Layout = new LayoutClass();
