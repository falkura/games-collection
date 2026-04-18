import { Container } from "pixi.js";
import { LayoutContainer } from "./LayoutContainer";
import { LayoutManager } from "./LayoutManager";
import { calculateLayoutString, isObject } from "./LayoutUtils";

export interface LayoutVars {
  /** Game X */
  gx: number;
  /** Game Y */
  gy: number;
  /** Game width */
  gw: number;
  /** Game height */
  gh: number;

  /** Screen width */
  sw: number;
  /** Screen height */
  sh: number;
  /** Bigger screen side, width or height */
  smax: number;
  /** Smaller screen side, width or height */
  smin: number;
}

export interface ManagerOptions {
  width: number;
  height: number;
  portrait: {
    width: number;
    height: number;
  };
}

export interface LayoutConfig<T extends Container = any> {
  view?: T;
  name?: string;
  portrait?: Omit<LayoutConfig<T>, "portrait" | "view">;
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
  alpha?: number;
  visible?: boolean;
  anchor?: { x?: string | number; y?: string | number } | string | number;
  scale?: { x?: string | number; y?: string | number } | string | number;
  onResize?: ({
    manager,
    vars,
    view,
  }: {
    manager: LayoutManager;
    vars: LayoutVars;
    view: T;
  }) => void;
}

export interface HandlerOptions<T extends keyof LayoutConfig> {
  vars: LayoutVars;
  key: T;
  value: LayoutConfig[T];
}

export function viewValueHandler(
  this: LayoutContainer,
  { key, value }: HandlerOptions<any>,
) {
  if (!this.view) return;
  this.view[key] = value;
}

export function emptyHandler() {}

export function unknownHandler(
  this: LayoutContainer,
  { key }: HandlerOptions<any>,
) {
  console.warn("Unknown property", key);
}

export function xyHandler(
  this: LayoutContainer,
  { key, value, vars }: HandlerOptions<"x" | "y">,
) {
  this[key] = calculateLayoutString(vars, value);
}

export function zIndexHandler(
  this: LayoutContainer,
  { key, value }: HandlerOptions<"zIndex">,
) {
  this[key] = value;
}

export function baseHandler(
  this: LayoutContainer,
  { key, value }: HandlerOptions<"zIndex" | "alpha" | "visible">,
) {
  (this as any)[key] = value;
}

export function dimensionsHandler(
  this: LayoutContainer,
  { key, value, vars }: HandlerOptions<"width" | "height">,
) {
  this.layoutParams[key] = calculateLayoutString(vars, value);
  if (!this.view) return;
  this.view[key] = this.layoutParams[key];
}

export function onResizeHandler(
  this: LayoutContainer,
  { value }: HandlerOptions<"onResize">,
) {
  (this as any)._onResize = value.bind(this);
}

export function setViewHandler(
  this: LayoutContainer,
  { key, value, vars }: HandlerOptions<"anchor">,
) {
  if (!this.view) return;

  if (isObject(value)) {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      if (this.view[key]?.[innerKey] !== undefined) {
        this.view[key][innerKey] = calculateLayoutString(
          vars,
          innerValue as string | number,
        );
      }
    });
  } else {
    this.view[key]?.set(calculateLayoutString(vars, value as string | number));
  }
}

export function setBaseHandler(
  this: LayoutContainer,
  { key, value, vars }: HandlerOptions<"scale">,
) {
  const target = this.view || this;

  if (isObject(value)) {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      target[key][innerKey] = calculateLayoutString(
        vars,
        innerValue as string | number,
      );
    });
  } else {
    target[key].set(calculateLayoutString(vars, value as string | number));
  }
}

export function RegisterHandlers() {
  LayoutManager.instance.registerLayoutHandler("x", xyHandler);
  LayoutManager.instance.registerLayoutHandler("y", xyHandler);
  LayoutManager.instance.registerLayoutHandler("width", dimensionsHandler);
  LayoutManager.instance.registerLayoutHandler("height", dimensionsHandler);
  LayoutManager.instance.registerLayoutHandler("zIndex", zIndexHandler);
  LayoutManager.instance.registerLayoutHandler("alpha", baseHandler);
  LayoutManager.instance.registerLayoutHandler("visible", baseHandler);
  LayoutManager.instance.registerLayoutHandler("anchor", setViewHandler);
  LayoutManager.instance.registerLayoutHandler("scale", setBaseHandler);
  LayoutManager.instance.registerLayoutHandler("onResize", onResizeHandler);
  LayoutManager.instance.registerLayoutHandler("portrait", emptyHandler);
  LayoutManager.instance.registerLayoutHandler("name", emptyHandler);
  LayoutManager.instance.registerLayoutHandler("view", emptyHandler);
  LayoutManager.instance.registerLayoutHandler("unknown", unknownHandler);
}
