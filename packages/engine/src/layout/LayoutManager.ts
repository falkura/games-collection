import { Container, RectangleLike, isMobile } from "pixi.js";
import { LayoutContainer } from "./LayoutContainer";
import {
  HandlerOptions,
  LayoutConfig,
  LayoutVars,
  ManagerOptions,
  RegisterHandlers,
} from "./LayoutHandlers";

export class LayoutManager {
  public isPortrait: boolean;

  /**
   * Game container bounds.
   *
   * Always equal to `options.width` / `options.height` for landscape and
   * `options.portrait.width` / `options.portrait.height` for portrait
   * */
  public game = {} as RectangleLike;
  public screen = {} as RectangleLike;

  private readonly root: Container;
  private static _instance: LayoutManager;

  public handlers: Record<
    keyof LayoutConfig<Container> | "unknown",
    (opts: HandlerOptions<any>) => void
  > = {} as any;

  constructor(
    root: Container,
    public readonly options: ManagerOptions,
  ) {
    this.root = root;

    LayoutManager.instance = this;

    RegisterHandlers();

    if (__DEV__) {
      globalThis.layout = this;
    }
  }

  public registerLayoutHandler(
    key: keyof typeof this.handlers,
    handler: (opts: HandlerOptions<any>) => void,
  ) {
    this.handlers[key] = handler;
  }

  public get isMobile(): boolean {
    return isMobile.any;
  }

  public static get instance() {
    return LayoutManager._instance;
  }

  public static set instance(value: LayoutManager) {
    if (LayoutManager._instance) return;
    LayoutManager._instance = value;
  }

  public resize(width: number, height: number, resolution: number = 1) {
    this.isPortrait = height > width;

    const { width: targetWidth, height: targetHeight } = this.isPortrait
      ? this.options.portrait
      : this.options;

    // calculate the largest scale that fits the game inside the screen without cropping
    const scaleFit = Math.min(width / targetWidth, height / targetHeight);

    // convert physical screen pixels into game size pixes relative to this.options
    this.screen.width = width / scaleFit;
    this.screen.height = height / scaleFit;

    this.game.x = (this.screen.width - targetWidth) / 2;
    this.game.y = (this.screen.height - targetHeight) / 2;

    this.game.width = targetWidth;
    this.game.height = targetHeight;

    this.root.scale.set(scaleFit / 1);
    this.updateCanvasSize(width, height);

    this.update(this.root, this.layoutContext);
  }

  public updateCanvasSize(width, height) {
    const canvas = document.getElementById("canvas");

    if (!canvas) {
      console.warn("Cannot find canvas!");
      return;
    }

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  public updateSingleNode(node: LayoutContainer, includeChildren = true) {
    if (!this.game.width) return;

    const vars = this.layoutContext;

    if (includeChildren) {
      this.update(node, vars);
    } else {
      node.updateLayout(this, vars);
    }
  }

  private get layoutContext(): LayoutVars {
    return {
      gx: this.game.x,
      gy: this.game.y,
      gw: this.game.width,
      gh: this.game.height,

      sw: this.screen.width,
      sh: this.screen.height,

      smax: Math.max(this.screen.width, this.screen.height),
      smin: Math.min(this.screen.width, this.screen.height),
    };
  }

  private update(node: LayoutContainer | Container, vars: LayoutVars) {
    if (node instanceof LayoutContainer) {
      node.updateLayout(this, vars);
    }

    for (const child of node.children) {
      this.update(child, vars);
    }
  }
}
