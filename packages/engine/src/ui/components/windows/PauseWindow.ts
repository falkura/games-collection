import AppWindow from "../basic/AppWindow";

export default class PauseWindow extends AppWindow {
  constructor(...args: ConstructorParameters<typeof AppWindow>) {
    super(...args);

    this.titleText = "Pause";
  }
}
