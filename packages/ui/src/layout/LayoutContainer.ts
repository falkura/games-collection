import { Assets, Container } from "pixi.js";
import { LayoutManager } from "./LayoutManager";

/**
 * Base class for layout construction
 */
export class LayoutContainer<T extends Container = any> extends Container {
  private _layout: Layout.Config<T>;
  private _layoutLandscape!: Layout.Config<T>;
  private _layoutPortrait!: Layout.Config<T>;
  private _view: T;
  private _onResize: Layout.Config["onResize"];

  /** @internal */
  public _layoutParams = {
    width: 0,
    height: 0,
  };

  constructor(layout: Layout.Config<T> = {} as any) {
    super();

    // Required for zIndex to work
    this.sortableChildren = true;

    if (layout.view) {
      this.view = layout.view;
      delete layout.view;
    }

    // Config loading
    if (layout.from) {
      const loadedLayout = Assets.get(layout.from);
      layout = Object.assign({}, loadedLayout, layout);

      if (loadedLayout.portrait && layout.portrait) {
        layout.portrait = Object.assign(
          {},
          loadedLayout.portrait,
          layout.portrait,
        );
      }
    }

    this.layout = layout;

    this.on("added", () => LayoutManager.instance.updateSingleNode(this));
  }

  public get layout(): Layout.Config<T> {
    return this._layout;
  }

  public set layout(value: Layout.Config<T>) {
    const self = this;
    const initial = !Boolean(this.layout);

    /**
     * Proxy detects any changes in layout and recalculates _layoutLandscape
     * and _layoutPortrait configs automatically
     */
    this._layout = new Proxy(value, {
      set(target, p, newValue, receiver) {
        const result = Reflect.set(target, p, newValue, receiver);
        self._recalculateLayout();
        return result;
      },
    });

    this._recalculateLayout();

    if (!initial) LayoutManager.instance.updateSingleNode(this);
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
   * them using {@link LayoutManager.HANDLERS}
   */
  public updateLayout(manager: LayoutManager, vars: Layout.LayoutVars) {
    const config = manager.isPortrait
      ? this._layoutPortrait
      : this._layoutLandscape;

    Object.entries(config).forEach(([key, value]) => {
      const k = key as keyof Layout.Config<any> | "unknown";
      const handler = LayoutManager.HANDLERS[k];

      if (handler) {
        handler.call(this, { vars, key: k, value });
      } else {
        LayoutManager.HANDLERS["unknown"].call(this, { vars, key: k, value });
      }
    });

    this._onResize &&
      this._onResize({
        manager,
        vars,
        layoutParams: this._layoutParams,
      });
  }
}
