export interface ModuleConstructor<T> extends Constructor<T> {
  // Unique ID
  MODULE_ID: string;
}

// TODO make TBase extends abstract class constructor
export default class ModuleManager<TBase> {
  // Service store
  protected readonly list: Map<string, TBase> = new Map();

  // Singleton
  public add<T extends ModuleConstructor<TBase>>(
    Ctor: T,
    ...args: ConstructorParameters<T>
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

    const instance = new Ctor(...args);

    this.onInit(instance);

    this.list.set(id, instance);

    return instance as InstanceType<T>;
  }

  // DI
  protected onInit<T extends TBase>(instance: T): T {
    return instance;
  }

  // Singleton
  public addAsync<T extends ModuleConstructor<TBase>>(
    Ctor: T,
    ...args: ConstructorParameters<T>
  ): Promise<InstanceType<T>> {
    const instance = this.add(Ctor, ...args);

    return this.onInitAsync(instance);
  }

  // DI
  protected onInitAsync<T extends TBase>(instance: T): Promise<T> {
    return new Promise<T>((resolve) => resolve(instance));
  }

  // Service locator
  public get<T extends ModuleConstructor<TBase>>(moduleId: string);
  public get<T extends ModuleConstructor<TBase>>(Ctor: T);
  public get<T extends ModuleConstructor<TBase>>(value: T | string) {
    let result;

    if (typeof value === "string") {
      result = this.list.get(value);
    } else {
      result = this.list.get(value.MODULE_ID);
    }

    return result;
  }
}
