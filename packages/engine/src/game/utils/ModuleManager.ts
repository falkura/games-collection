export interface ModuleConstructor<T> extends Constructor<T> {
  // Unique ID
  MODULE_ID: string;
}

export class ModuleManager<TBase> {
  protected readonly list: Map<string, TBase> = new Map();

  public add<T extends ModuleConstructor<TBase>>(Ctor: T): InstanceType<T> {
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

  protected create<T extends ModuleConstructor<TBase>>(Ctor: T): TBase {
    return new Ctor();
  }

  public get<T extends ModuleConstructor<TBase>>(
    moduleId: string,
  ): InstanceType<T>;
  public get<T extends ModuleConstructor<TBase>>(Ctor: T): InstanceType<T>;
  public get<T extends ModuleConstructor<TBase>>(
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
}
