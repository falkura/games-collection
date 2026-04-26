import { Container, Ticker } from "pixi.js";
import { System } from "./System";
import gsap from "gsap";
import { GameController } from "@falkura-pet/engine";

export interface ModuleConstructor<T> extends Constructor<T> {
  /** Unique identifier used for registration and lookup. */
  MODULE_ID: string;
}

/** Manages all {@link System} instances for a game. Access via `game.systems`. */
export class SystemController<TGame extends GameController = GameController> {
  protected readonly list: Map<string, System<TGame>> = new Map();
  protected readonly disabledRegistry: Map<string, System<TGame>> = new Map();
  protected readonly buildedRegistry: Map<string, System<TGame>> = new Map();

  constructor(private readonly game: TGame) {}

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

  /** Register a system. Call inside `GameController.init`. */
  public add<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
  ): InstanceType<T> {
    const id = Ctor.MODULE_ID;

    if (!id) {
      throw new Error(
        `Module class must declare static MODULE_ID [${Ctor.name}].`,
      );
    }

    if (this.list.has(id)) {
      throw new Error(`Module with id [${id}] already added.`);
    }

    const instance = this.create(Ctor) as InstanceType<T>;

    this.list.set(id, instance);

    return instance;
  }

  /** Retrieve a system by class or `MODULE_ID` string. */
  public get<T extends ModuleConstructor<System<TGame>>>(
    moduleId: string,
  ): InstanceType<T>;
  public get<T extends ModuleConstructor<System<TGame>>>(
    Ctor: T,
  ): InstanceType<T>;
  public get<T extends ModuleConstructor<System<TGame>>>(
    value: T | string,
  ): InstanceType<T> {
    let result;

    if (typeof value === "string") {
      result = this.list.get(value);
    } else {
      result = this.list.get(value.MODULE_ID);
    }

    return result;
  }

  /** Remove a system from the active list and display tree. Its hooks stop firing. Can be re-enabled later. */
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

    this.game.view.removeChild(system.view);

    return system as InstanceType<T>;
  }

  /** Re-add a previously disabled system to the active list and display tree. Calls `build` if not yet built. */
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

    system.resize();

    return system as InstanceType<T>;
  }

  /** Enable all disabled systems. */
  public enableAll() {
    this.disabledRegistry.forEach((_, ID) => this.enable(ID));
  }

  /** Disable all active systems. */
  public disableAll() {
    this.list.forEach((_, ID) => this.disable(ID));
  }

  /** @internal */
  build() {
    this.list.forEach((system, MODULE_ID) => {
      if (this.buildedRegistry.has(MODULE_ID)) return;

      system.build();
      this.buildedRegistry.set(MODULE_ID, system);
    });
  }

  /** @internal */
  start() {
    this.list.forEach((s) => s.start());
  }

  /** @internal */
  finish(data?: any) {
    this.list.forEach((s) => s.finish(data));
  }

  /** @internal */
  reset() {
    this.list.forEach((s) => s.reset());
  }

  /** @internal */
  resize() {
    this.list.forEach((s) => s.resize());
  }

  /** @internal */
  tick(ticker: Ticker) {
    this.list.forEach((s) => s.tick(ticker));
  }
}
