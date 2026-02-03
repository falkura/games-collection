import { UIEvent } from "../../../events/IUIEvents";
import AppWindow from "../basic/AppWindow";
import TextButton from "../TextButton";

export default class PauseWindow extends AppWindow {
  continueButton: TextButton;

  constructor(...args: ConstructorParameters<typeof AppWindow>) {
    super(...args);

    this.titleText = "Pause";

    this.continueButton = new TextButton({
      text: "Continue",
      layout: {
        position: "absolute",
        bottom: 0,
        margin: 15,
      },
    });

    this.addChild(this.continueButton.view);
  }

  public override onInit(): void {
    this.continueButton.onPress.connect(() =>
      this.ui.events.emit(UIEvent.ResumeGame),
    );
  }
}
