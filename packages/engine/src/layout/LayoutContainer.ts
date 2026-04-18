import { Container } from "pixi.js";
import { LayoutManager } from "./LayoutManager";
import { LayoutConfig, LayoutVars } from "./LayoutHandlers";

/**
 * Base class for layout construction
 */
export class LayoutContainer<T extends Container = any> extends Container {
  public layoutWidth = 0;
  public layoutHeight = 0;
  public label = "";

  private _layout: LayoutConfig<T>;
  private _layoutLandscape!: LayoutConfig<T>;
  private _layoutPortrait!: LayoutConfig<T>;
  private _view: T;
  private _onResize: LayoutConfig["onResize"];
  private _initialized = false;

  /** @internal */
  public layoutParams = {
    width: 0,
    height: 0,
  };

  constructor(layout: LayoutConfig<T> = {} as any) {
    super();

    // Required for zIndex to work
    this.sortableChildren = true;

    if (layout.view) {
      this.view = layout.view;
      delete layout.view;
    }

    this.layout = layout;
    this._initialized = true;

    this.on("added", () => LayoutManager.instance.updateSingleNode(this));
  }

  public addChildWithLayout<TChild extends Container>(
    child: TChild,
    layout: Omit<LayoutConfig<TChild>, "view">,
  ): LayoutContainer<TChild> {
    const layoutChild = new LayoutContainer<TChild>({
      view: child,
      ...layout,
    });

    this.addChild(layoutChild);

    LayoutManager.instance.updateSingleNode(layoutChild);

    return layoutChild;
  }

  public get layout(): LayoutConfig<T> {
    return this._layout;
  }

  public set layout(value: LayoutConfig<T>) {
    const initial = !Boolean(this.layout);

    this._layout = value;

    this._recalculateLayout();

    if (!initial && this._initialized)
      LayoutManager.instance.updateSingleNode(this);
  }

  /**
   * Recalculation needed for generating portrait config
   * using landscape config as default and portrait as overrides.
   */
  private _recalculateLayout() {
    this._layoutLandscape = Object.assign({}, this.layout);

    if (this.layout.portrait) {
      this._layoutPortrait = Object.assign(
        {},
        this.layout,
        this.layout.portrait,
      );

      delete this._layoutPortrait.portrait;
      delete this._layoutLandscape.portrait;
    } else {
      this._layoutPortrait = this._layoutLandscape;
    }
  }

  set view(value: T) {
    if (this._view) {
      this.removeChild(this._view);
    }

    this._view = value;
    this.addChild(value);
  }

  get view() {
    return this._view;
  }

  /**
   * Run through all the current config properties and apply
   * them using {@link LayoutManager.handlers}
   */
  public updateLayout(manager: LayoutManager, vars: LayoutVars) {
    const config = manager.isPortrait
      ? this._layoutPortrait
      : this._layoutLandscape;

    Object.entries(config).forEach(([key, value]) => {
      const k = key as keyof LayoutConfig<any> | "unknown";
      const handler = LayoutManager.instance.handlers[k];

      if (handler) {
        handler.call(this, { vars, key: k, value });
      } else {
        LayoutManager.instance.handlers["unknown"].call(this, {
          vars,
          key: k,
          value,
        });
      }
    });

    this._onResize &&
      this._onResize({
        manager,
        vars,
        view: this.view,
      });
  }
}
