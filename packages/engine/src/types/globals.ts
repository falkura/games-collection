/// <reference types="gsap" />

declare global {
  interface IGameConfig {
    description: string;
    icon: string;
    route: string;
    title: string;
    version: string;
    enabled?: boolean;
    order?: number;
  }

  type IGamesConfig = Record<string, IGameConfig>;

  interface IWrapperConfig {
    title: string;
    subtitle: string;
    url?: string;
  }

  type MethodKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
  }[keyof T];

  type Constructor<T> = new (...args: any[]) => T;
  type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

  type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;

  type RecordLike<TKey extends string, TValue> = { [K in TKey]: TValue };
}

export {};
