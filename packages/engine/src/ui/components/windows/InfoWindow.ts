import { CanvasTextOptions, Text } from "pixi.js";
import { LayoutContainer } from "@pixi/layout/components";
import TextButton from "../TextButton";
import AppWindow from "../basic/AppWindow";

export default class InfoWindow extends AppWindow {
  continueButton: TextButton;
  description: Text;

  constructor(...args: ConstructorParameters<typeof AppWindow>) {
    super(...args);

    this.titleText = "About";

    this.layout = {
      gap: 15,
      padding: 15,
    };

    const scrollBox = new LayoutContainer({
      layout: {
        width: "80%",
        maxHeight: "80%",
        overflow: "scroll",
        padding: 20,
        gap: 10,
        backgroundColor: "#202020",
        borderColor: 0xffffff,
        borderRadius: 12,
      },
    });

    this.addChild(scrollBox);

    this.description = new Text({
      style: {
        fontSize: 24,
        fill: "#cdcdcdff",
        wordWrap: true,
      },
      layout: {
        objectFit: "none",
        width: "100%",
      },
      text: `What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`,
    } satisfies CanvasTextOptions);

    scrollBox.addChild(this.description);

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
    this.continueButton.onPress.connect(() => this.ui.onCloseInfo());
  }

  setData(data: { title: string; description: string }) {
    this.titleText = data.title;
    this.description.text = data.description;
  }
}
