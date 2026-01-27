import { Tail } from "../../Utils";
import { UIType } from "../UI";
import { GameScreen } from "./screens/GameScreen";
import { LoadScreen } from "./screens/LoadScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { IntroScreen } from "./screens/wrapper/IntroScreen";
import InfoWindow from "./windows/InfoWindow";
import PauseWindow from "./windows/PauseWindow";

declare global {
  interface ScreensMap {
    menu: MenuScreen;
    result: ResultScreen;
    load: LoadScreen;
    game: GameScreen;
    wrapper_intro: IntroScreen;
  }
}

declare global {
  interface WindowsMap {
    pause: PauseWindow;
    info: InfoWindow;
  }
}

export const RegisterUI = (ui: UIType, options?: UIOverrides) => {
  ui.screens.register("load", LoadScreen);
  ui.screens.register("menu", MenuScreen);
  ui.screens.register("game", GameScreen);
  ui.screens.register("result", ResultScreen);
  ui.screens.register("wrapper_intro", IntroScreen);

  ui.windows.register("pause", PauseWindow);
  ui.windows.register("info", InfoWindow);

  // Custom views
  if (options?.screens) {
    options.screens.forEach((data) => {
      ui.screens.register(data.className, data.classCtor, ...data.classArgs);
    });
  }

  if (options?.windows) {
    options.windows.forEach((data) => {
      ui.windows.register(data.className, data.classCtor, ...data.classArgs);
    });
  }

  ui.screens.build();
  ui.windows.build();
};

export interface CustomScreen<
  T extends keyof ScreensMap = any,
  Ctor extends new (...args: any[]) => ScreensMap[T] = any,
> {
  className: T;
  classCtor: Ctor;
  classArgs?: Tail<ConstructorParameters<Ctor>>;
}

export interface CustomWindow<
  T extends keyof WindowsMap = any,
  Ctor extends new (...args: any[]) => WindowsMap[T] = any,
> {
  className: T;
  classCtor: Ctor;
  classArgs?: Tail<ConstructorParameters<Ctor>>;
}

export interface UIOverrides {
  screens: Array<CustomScreen>;
  windows: Array<CustomWindow>;
}
