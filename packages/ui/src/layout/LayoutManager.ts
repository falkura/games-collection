import { Container, RectangleLike } from "pixi.js";
import { LayoutContainer } from "./LayoutContainer";

declare global {
  namespace Layout {
    interface ManagerOptions {
      width: number;
      height: number;
      portrait: {
        width: number;
        height: number;
      };
    }
  }
}

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
  private readonly options: Layout.ManagerOptions;
  private scale: number;
  private static _instance: LayoutManager;

  public static HANDLERS: Record<
    keyof Layout.Config<Container> | "unknown",
    Layout.Handler
  > = {} as any;

  constructor(root: Container, options: Layout.ManagerOptions) {
    this.root = root;
    this.options = options;

    LayoutManager.instance = this;
  }

  public static registerLayoutHandler(
    key: keyof typeof LayoutManager.HANDLERS,
    handler: Layout.Handler,
  ) {
    LayoutManager.HANDLERS[key] = handler;
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
    this.scale = scaleFit / 1;

    // convert physical screen pixels into game size pixes relative to this.options
    this.screen.width = width / scaleFit;
    this.screen.height = height / scaleFit;

    this.game.x = (this.screen.width - targetWidth) / 2;
    this.game.y = (this.screen.height - targetHeight) / 2;

    this.game.width = targetWidth;
    this.game.height = targetHeight;

    this.root.scale.set(this.scale);
    this.updateCanvasSize(width, height);

    const vars = this.createLayoutVars(this.root);
    this.update(this.root, vars);
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
    const vars = this.createLayoutVars(node);

    if (includeChildren) {
      this.update(node, vars);
    } else {
      node.updateLayout(this, vars);
    }
  }

  private createLayoutVars(
    target: LayoutContainer | Container,
  ): Layout.LayoutVars {
    const vars: Layout.LayoutVars = {
      gx: this.game.x,
      gy: this.game.y,
      gw: this.game.width,
      gh: this.game.height,

      sw: this.screen.width,
      sh: this.screen.height,

      smax: Math.max(this.screen.width, this.screen.height),

      gs: this.scale,

      pw: null,
      ph: null,
    };

    return this.updateLayoutVarsParent(target, vars);
  }

  private updateLayoutVarsParent(
    target: LayoutContainer | Container,
    vars: Layout.LayoutVars,
  ): Layout.LayoutVars {
    let pw = vars.gw;
    let ph = vars.gh;

    if (target.parent instanceof LayoutContainer) {
      pw = target.parent._layoutParams.width || pw;
      ph = target.parent._layoutParams.height || pw;
    }

    vars.pw = pw;
    vars.ph = ph;

    return vars;
  }

  private update(node: LayoutContainer | Container, vars: Layout.LayoutVars) {
    if (node instanceof LayoutContainer) {
      node.updateLayout(this, this.updateLayoutVarsParent(node, vars));
    }

    for (const child of node.children) {
      this.update(child, vars);
    }
  }
}
