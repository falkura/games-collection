import { Container, PointData, Size } from "pixi.js";
import { LayoutContainer } from "./LayoutContainer";
import { LayoutManager } from "./LayoutManager";
import { isObject, calculateLayoutString } from "./LayoutUtils";

declare global {
  namespace Layout {
    interface Config<T = Container> {
      x?: string | number;
      y?: string | number;
      width?: string | number;
      height?: string | number;
      zIndex?: number;
      anchor?: PointData | string | number;
      scale?: PointData | string | number;
      onResize?: ({
        manager,
        vars,
        layoutParams,
      }: {
        manager: LayoutManager;
        vars: Layout.LayoutVars;
        layoutParams: Size;
      }) => void;
    }
  }
}

export function xyHandler(
  this: LayoutContainer,
  { key, value, vars }: Layout.HandlerOptions<"x" | "y">,
) {
  this[key] = calculateLayoutString(vars, value);
}

export function zIndexHandler(
  this: LayoutContainer,
  { key, value }: Layout.HandlerOptions<"zIndex">,
) {
  this[key] = value;
}

export function widthHandler(
  this: LayoutContainer,
  { key, value, vars }: Layout.HandlerOptions<"width">,
) {
  this._layoutParams.width = calculateLayoutString(vars, value);
  if (!this.view) return;
  this.view[key] = this._layoutParams.width;
}

export function heightHandler(
  this: LayoutContainer,
  { key, value, vars }: Layout.HandlerOptions<"height">,
) {
  this._layoutParams.height = calculateLayoutString(vars, value);
  if (!this.view) return;
  this.view[key] = this._layoutParams.height;
}

export function onResizeHandler(
  this: LayoutContainer,
  { value }: Layout.HandlerOptions<"onResize">,
) {
  (this as any)._onResize = value.bind(this);
}

export function setHandler(
  this: LayoutContainer,
  { key, value, vars }: Layout.HandlerOptions<"anchor" | "scale">,
) {
  if (!this.view) return;
  if (isObject(value)) {
    Object.entries(value).forEach(([iKey, iValue]) => {
      this.view[key][iKey] = calculateLayoutString(vars, iValue as any);
    });
  } else {
    this.view[key].set(calculateLayoutString(vars, value as string | number));
  }
}

LayoutManager.registerLayoutHandler("x", xyHandler);
LayoutManager.registerLayoutHandler("y", xyHandler);
LayoutManager.registerLayoutHandler("width", widthHandler);
LayoutManager.registerLayoutHandler("height", heightHandler);
LayoutManager.registerLayoutHandler("anchor", setHandler);
LayoutManager.registerLayoutHandler("scale", setHandler);
LayoutManager.registerLayoutHandler("zIndex", zIndexHandler);
LayoutManager.registerLayoutHandler("onResize", onResizeHandler);

export {};
