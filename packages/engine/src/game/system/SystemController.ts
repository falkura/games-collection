import { Container, Ticker } from "pixi.js";
import { GameController } from "../GameController";
import { System } from "./System";
import gsap from "gsap";
import { type ModuleConstructor, ModuleManager } from "../utils/ModuleManager";

export class SystemController<
  TGame extends GameController = GameController,
> extends ModuleManager<System<TGame>> {
  protected readonly disabledRegistry: typeof this.list = new Map();
  protected readonly buildedRegistry: typeof this.list = new Map();

  constructor(private readonly game: TGame) {
    super();
  }

  protected create<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
  ): System<TGame> {
    const instance = new Ctor();

    instance.game = this.game;

    instance.timeline = gsap.timeline({ paused: false });
    this.game.timeline.add(instance.timeline, "<");

    instance.view = new Container();
    instance.view.zIndex = this.list.size;
    this.game.view.addChild(instance.view);

    this.enable(Ctor);

    return instance;
  }

  public disable<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
  ): InstanceType<T>;
  public disable(MODULE_ID: string): System<TGame>;
  public disable<T extends ModuleConstructor<System<TGame>>>(
    value: T | string,
  ): InstanceType<T> {
    const MODULE_ID = typeof value === "string" ? value : value.MODULE_ID;
    if (!this.list.has(MODULE_ID)) return null;

    const system = this.list.get(MODULE_ID);
    this.list.delete(MODULE_ID);

    this.disabledRegistry.set(MODULE_ID, system);

    system.enabled = false;
    system.unmount();

    this.game.view.removeChild(system.view);

    return system as InstanceType<T>;
  }

  public enable<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
  ): InstanceType<T>;
  public enable(MODULE_ID: string): System<TGame>;
  public enable<T extends ModuleConstructor<System<TGame>>>(
    value: T | string,
  ): InstanceType<T> {
    const MODULE_ID = typeof value === "string" ? value : value.MODULE_ID;
    if (!this.disabledRegistry.has(MODULE_ID)) return null;

    const system = this.disabledRegistry.get(MODULE_ID);
    this.disabledRegistry.delete(MODULE_ID);

    this.list.set(MODULE_ID, system);
    this.game.view.addChild(system.view);

    if (!this.buildedRegistry.has(MODULE_ID)) {
      system.build();
      this.buildedRegistry.set(MODULE_ID, system);
    }

    system.enabled = true;
    system.mount();
    system.resize();

    return system as InstanceType<T>;
  }

  public get all(): System<TGame>[] {
    return Array.from(this.list.values()).concat(
      Array.from(this.disabledRegistry.values()),
    );
  }

  public enableAll() {
    this.disabledRegistry.forEach((_, ID) => this.enable(ID));
  }

  public disableAll() {
    this.list.forEach((_, ID) => this.disable(ID));
  }

  public start() {
    this.list.forEach((system) => {
      system.start();
    });
  }

  public finish(data?: any) {
    this.list.forEach((system) => {
      system.finish(data);
    });
  }

  public reset() {
    this.list.forEach((system) => {
      system.reset();
    });
  }

  public resize() {
    this.list.forEach((system) => {
      system.resize();
    });
  }

  public tick(ticker: Ticker) {
    this.list.forEach((system) => {
      system.tick(ticker);
    });
  }
}
