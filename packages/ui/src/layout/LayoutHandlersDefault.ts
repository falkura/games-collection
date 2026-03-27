import { LayoutContainer } from "./LayoutContainer";
import { LayoutManager } from "./LayoutManager";
import { isObject } from "./LayoutUtils";

declare global {
  namespace Layout {
    interface Config<T> {
      from?: string;
      view?: T;
      /** Pass directly into the view */
      internal?: {
        [key in keyof T]?: any;
      } & { [key: string]: any };
      portrait?: Omit<Config<T>, "portrait" | "from" | "view">;
    }

    interface HandlerOptions<T extends keyof Config<any>> {
      vars: LayoutVars;
      key: T;
      value: Config<any>[T];
    }

    type Handler = (opts: HandlerOptions<any>) => void;
  }
}

export function defaultHandler(
  this: LayoutContainer,
  { key, value }: Layout.HandlerOptions<any>,
) {
  if (!this.view) return;
  this.view[key] = value;
}

export function internalHandler(
  this: LayoutContainer,
  { key, value }: Layout.HandlerOptions<"internal">,
) {
  if (!this.view) return;

  Object.entries(value).forEach(([key1, value1]) => {
    if (isObject(value1)) {
      console.warn("No handler for deep object setting");
    } else {
      this.view[key1] = value1;
    }
  });
}

export function emptyHandler() {}

export function unknownHandler(
  this: LayoutContainer,
  { key }: Layout.HandlerOptions<any>,
) {
  console.warn("Unknown property", key);
}

LayoutManager.registerLayoutHandler("internal", internalHandler);
LayoutManager.registerLayoutHandler("from", emptyHandler);
LayoutManager.registerLayoutHandler("portrait", emptyHandler);
LayoutManager.registerLayoutHandler("view", emptyHandler);
LayoutManager.registerLayoutHandler("unknown", unknownHandler);

export {};
