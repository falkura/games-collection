import { isMobile, Size } from "pixi.js";

class LayoutClass {
  private _w = 0;
  private _h = 0;
  private _scaleFit = 1;

  private TARGET_LANDSCAPE = { width: 1920, height: 1080 };
  private TARGET_PORTRAIT = { width: 1080, height: 1920 };

  private get _target(): { width: number; height: number } {
    return this.isPortrait ? this.TARGET_PORTRAIT : this.TARGET_LANDSCAPE;
  }

  public updateTargetDimensions(sizeLandscape: Size, sizePortrait: Size) {
    this.TARGET_LANDSCAPE = sizeLandscape;
    this.TARGET_PORTRAIT = sizePortrait;
  }

  public resize(width: number, height: number, resolution: number) {
    this._w = width;
    this._h = height;

    const { width: tw, height: th } = this._target;
    this._scaleFit = Math.min(this._w / tw, this._h / th);
  }

  get gameX(): number {
    return (this.screenWidth - this.gameWidth) / 2;
  }

  get gameY(): number {
    return (this.screenHeight - this.gameHeight) / 2;
  }

  get gameWidth(): number {
    return this._target.width;
  }

  get gameHeight(): number {
    return this._target.height;
  }

  get screenWidth(): number {
    return this._w / this._scaleFit;
  }

  get screenHeight(): number {
    return this._h / this._scaleFit;
  }

  get isPortrait(): boolean {
    return this._h > this._w;
  }

  get isMobile(): boolean {
    return isMobile.any;
  }

  get screenMax(): number {
    return Math.max(this.screenWidth, this.screenHeight);
  }

  get screenMin(): number {
    return Math.min(this.screenWidth, this.screenHeight);
  }

  get scale(): number {
    return this._scaleFit;
  }

  screen = new LayoutScreenHelper(this);
  game = new LayoutGameHelper(this);
}

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

  get center() {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  fromTop(value = 0) {
    return this.y + value;
  }

  fromBottom(value = 0) {
    return this.y + this.height - value;
  }

  fromLeft(value = 0) {
    return this.x + value;
  }

  fromRight(value = 0) {
    return this.x + this.width - value;
  }
}

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
