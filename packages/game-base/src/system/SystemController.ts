import { Ticker } from "pixi.js";
import { GameBase } from "../GameBase";
import { System } from "./System";
import gsap from "gsap";
import { ModuleManager, type ModuleConstructor } from "@falkura-pet/engine";

export class SystemController<
  TGame extends GameBase = GameBase,
> extends ModuleManager<System<TGame>> {
  protected readonly disabledRegistry: typeof this.list = new Map();

  constructor(private readonly game: TGame) {
    super();
  }

  public override add<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
    ...args: ConstructorParameters<T>
  ): InstanceType<T> {
    const result = super.add(Ctor, ...args);

    this.game.onSystemAdded(Ctor.MODULE_ID);

    return result;
  }

  protected override onInit<T extends System<TGame>>(instance: T): T {
    instance.game = this.game;
    instance.enabled = true;

    instance.timeline = gsap.timeline({ paused: false });
    this.game.timeline.add(instance.timeline, "<");

    instance.view = this.game.ui.createGameView();
    instance.view.zIndex = this.list.size;
    this.game.view.addChild(instance.view);

    return instance;
  }

  public disable<TModule extends System<TGame>>(
    Ctor: ModuleConstructor<TModule>,
  ): boolean;
  public disable(MODULE_ID: string): boolean;
  public disable<TModule extends System<TGame>>(
    value: ModuleConstructor<TModule> | string,
  ): boolean {
    const MODULE_ID = typeof value === "string" ? value : value.MODULE_ID;
    if (!this.list.has(MODULE_ID)) return false;

    const system = this.list.get(MODULE_ID);
    this.list.delete(MODULE_ID);

    this.disabledRegistry.set(MODULE_ID, system);
    system.enabled = false;

    this.game.view.removeChild(system.view);

    return true;
  }

  public enable<TModule extends System<TGame>>(
    Ctor: ModuleConstructor<TModule>,
  ): boolean;
  public enable(MODULE_ID: string): boolean;
  public enable<TModule extends System<TGame>>(
    value: ModuleConstructor<TModule> | string,
  ): boolean {
    const MODULE_ID = typeof value === "string" ? value : value.MODULE_ID;
    if (!this.disabledRegistry.has(MODULE_ID)) return false;

    const system = this.disabledRegistry.get(MODULE_ID);
    this.disabledRegistry.delete(MODULE_ID);

    this.list.set(MODULE_ID, system);
    system.enabled = true;

    this.game.view.addChild(system.view);

    return true;
  }

  public start() {
    this.list.forEach((system) => {
      system.start();
    });
  }

  public finish(isWin?: boolean) {
    this.list.forEach((system) => {
      system.finish(isWin);
    });
  }

  public reset() {
    for (const key of this.disabledRegistry.keys()) {
      this.enable(key);
    }

    this.list.forEach((system) => {
      system.reset();
    });
  }

  public pause() {
    this.list.forEach((system) => {
      system.pause();
    });
  }

  public resume() {
    this.list.forEach((system) => {
      system.resume();
    });
  }

  public tick(ticker: Ticker) {
    this.list.forEach((system) => {
      system.tick(ticker);
    });
  }
}
