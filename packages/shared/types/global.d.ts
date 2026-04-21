/// <reference types="@rslib/core/types" />

export {};

declare global {
  const root: HTMLDivElement;
  const canvas: HTMLCanvasElement;
  const __DEV__: boolean;

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

  type Constructor<T> = new (...args: any[]) => T;
}
