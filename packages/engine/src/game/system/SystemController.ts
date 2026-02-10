import { Container, Ticker } from "pixi.js";
import ModuleManager, { ModuleConstructor } from "../../modules/ModuleManager";
import Game from "../Game";
import { System } from "./System";
import gsap from "gsap";

export class SystemController<TGame extends Game = Game> extends ModuleManager<
  System<TGame>
> {
  protected readonly disabledRegistry: typeof this.list = new Map();

  constructor(private readonly game: TGame) {
    super();
  }

  protected override onInit<T extends System<TGame>>(instance: T): T {
    instance.game = this.game;
    instance.enabled = true;
    instance.timeline = gsap.timeline({ paused: false });

    this.game.timeline.add(instance.timeline, "<");

    instance.view = new Container({
      layout: {
        width: "100%",
        height: "100%",
      },
      zIndex: this.list.size,
    });

    this.game.view.addChild(instance.view);

    return instance;
  }

  public disable<TModule extends System<TGame>>(
    Ctor: ModuleConstructor<TModule>,
  ): boolean {
    if (!this.list.has(Ctor.MODULE_ID)) return false;

    const system = this.list.get(Ctor.MODULE_ID);
    this.list.delete(Ctor.MODULE_ID);

    this.disabledRegistry.set(Ctor.MODULE_ID, system);
    system.enabled = false;

    this.game.view.removeChild(system.view);

    return true;
  }

  public enable<TModule extends System<TGame>>(
    Ctor: ModuleConstructor<TModule>,
  ): boolean {
    if (!this.disabledRegistry.has(Ctor.MODULE_ID)) return false;

    const system = this.disabledRegistry.get(Ctor.MODULE_ID);
    this.disabledRegistry.delete(Ctor.MODULE_ID);

    this.list.set(Ctor.MODULE_ID, system);
    system.enabled = true;

    this.game.view.addChild(system.view);

    return true;
  }

  public start() {
    this.list.forEach((system) => {
      system.start();
    });
  }

  public finish() {
    this.list.forEach((system) => {
      system.finish();
    });
  }

  public reset() {
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
