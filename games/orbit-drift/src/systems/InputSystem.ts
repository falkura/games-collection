import { FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { Engine, Layout } from "@falkura-pet/engine";
import { Ticker } from "pixi.js";
import { OrbitDrift } from "../OrbitDrift";
import { SpaceSystem } from "./SpaceSystem";
import { TRAJECTORY_PREVIEW } from "../config";
import { System } from "./System";

export class InputSystem extends System<OrbitDrift> {
  static MODULE_ID = "input";

  private dragging = false;
  private pointerId: number | null = null;
  private start_ = new Point();
  private end = new Point();

  private preview: Graphics;
  private impulseLine: Graphics;

  override reset(): void {
    this.dragging = false;
    this.pointerId = null;
    this.preview.clear();
    this.impulseLine.clear();
  }

  override resize(): void {
    const { width, height } = Layout.screen;
    const dragBeyondScreenMargin = 800;

    this.view.hitArea = new Rectangle(
      -dragBeyondScreenMargin,
      -dragBeyondScreenMargin,
      width + dragBeyondScreenMargin * 2,
      height + dragBeyondScreenMargin * 2,
    );
  }

  override tick(_ticker: Ticker): void {
    if (!this.dragging) return;
    if (!this.space?.active) return;

    this.drawPreview();
  }

  override build() {
    this.preview = new Graphics();
    this.preview.zIndex = 5;
    this.impulseLine = new Graphics();
    this.impulseLine.zIndex = 5;
    this.view.addChild(this.preview, this.impulseLine);

    this.view.eventMode = "static";

    this.view.on("pointerdown", this.onDown);
    this.view.on("pointermove", this.onMove);
    this.view.on("pointerup", this.onUp);
    this.view.on("pointerupoutside", this.onUp);
    this.view.on("pointercancel", this.onUp);
  }

  private get space() {
    return this.game.systems.get(SpaceSystem);
  }

  private onDown = (e: FederatedPointerEvent) => {
    const space = this.space;
    if (!space?.active) return;
    if (this.dragging) return;

    this.view.toLocal(e.global, undefined, this.start_);
    this.end.copyFrom(this.start_);
    this.dragging = true;
    this.pointerId = e.pointerId;

    space.setAiming(true);
    this.drawPreview();
  };

  private onMove = (e: FederatedPointerEvent) => {
    if (!this.dragging) return;
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
    this.view.toLocal(e.global, undefined, this.end);
    this.drawPreview();
  };

  private onUp = (e: FederatedPointerEvent) => {
    if (!this.dragging) return;
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;

    this.dragging = false;
    this.pointerId = null;

    const space = this.space;
    if (space?.active) {
      const { dx, dy } = this.clampedDrag();
      if (dx !== 0 || dy !== 0) {
        space.applyImpulse(dx, dy);
      }
      space.setAiming(false);
    }

    this.preview.clear();
    this.impulseLine.clear();
  };

  private clampedDrag() {
    const max = this.space.maxDragDistance;
    let dx = this.start_.x - this.end.x;
    let dy = this.start_.y - this.end.y;
    const mag = Math.hypot(dx, dy);
    if (mag > max) {
      dx = (dx / mag) * max;
      dy = (dy / mag) * max;
    }
    return { dx, dy };
  }

  private drawPreview() {
    const space = this.space;
    const ship = space.ship;
    const { dx, dy } = this.clampedDrag();
    const previewWidth = Layout.isMobile
      ? TRAJECTORY_PREVIEW.WIDTH * 2
      : TRAJECTORY_PREVIEW.WIDTH;

    const vx = dx * space.dragImpulseScale;
    const vy = dy * space.dragImpulseScale;

    const points = space.simulate(ship.x, ship.y, vx, vy);

    this.preview.clear();
    if (points.length >= 2) {
      for (let i = 1; i < points.length; i += TRAJECTORY_PREVIEW.DASH_EVERY) {
        const a = points[i - 1];
        const b = points[i];
        this.preview.moveTo(a.x, a.y).lineTo(b.x, b.y);
      }
      this.preview.stroke({
        color: TRAJECTORY_PREVIEW.COLOR,
        width: previewWidth,
        alpha: TRAJECTORY_PREVIEW.ALPHA,
        pixelLine: true,
      });
    }

    this.impulseLine.clear();
    this.impulseLine
      .moveTo(ship.x, ship.y)
      .lineTo(ship.x + dx, ship.y + dy)
      .stroke({
        color: TRAJECTORY_PREVIEW.COLOR,
        width: 2,
        alpha: 0.9,
        pixelLine: true,
      })
      .circle(ship.x + dx, ship.y + dy, 5)
      .fill({ color: TRAJECTORY_PREVIEW.COLOR });
  }
}
