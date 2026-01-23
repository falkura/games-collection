import { Button as BaseButton } from "@pixi/ui";
import gsap from "gsap";
import { Container, isMobile } from "pixi.js";

type State = "default" | "hover" | "pressed" | "disabled";

type AnimationData = {
  x?: number;
  y?: number;
  scale?: number;
};

type Animation = {
  props: AnimationData;
  duration?: number;
};

export type StateAnimations = {
  [K in State]?: Animation;
};

export default class Button extends BaseButton {
  protected animations: StateAnimations;
  protected originalInnerViewState: AnimationData;
  protected state: State;
  protected defaultDuration = 0.1;

  constructor(
    view: Container,
    animations: StateAnimations = {
      hover: {
        props: {
          scale: 1.1,
        },
        duration: 0.1,
      },
      pressed: {
        props: {
          scale: 0.9,
        },
        duration: 0.1,
      },
    },
  ) {
    super(view);

    if (animations) {
      this.animations = animations;
      this.setOriginalInnerViewState();

      this.setState("default");
      this.initStateControl();
    }
  }

  protected initStateControl() {
    this.onDown.connect(() => {
      this.setState("pressed");
    });

    this.onUp.connect(() => {
      this.setState(isMobile.any ? "default" : "hover");
    });

    this.onUpOut.connect(() => {
      this.setState("default");
    });

    this.onOut.connect(() => {
      if (!this.isDown) {
        this.setState("default");
      }
    });

    this.onPress.connect(() => {
      this.setState(isMobile.any ? "default" : "hover");
    });

    this.onHover.connect(() => {
      if (!this.isDown) {
        this.setState(isMobile.any ? "default" : "hover");
      }
    });
  }

  protected setOriginalInnerViewState() {
    this.originalInnerViewState = {
      x: this.view.x,
      y: this.view.y,
      scale: this.view.scale.x,
    };

    const defaultStateAnimation = this.animations?.default;

    if (defaultStateAnimation) {
      this.view.x =
        defaultStateAnimation.props.x ?? this.originalInnerViewState.x ?? 0;
      this.view.y =
        defaultStateAnimation.props.y ?? this.originalInnerViewState.y ?? 0;
      this.view.scale.x =
        defaultStateAnimation.props.scale ??
        this.originalInnerViewState.scale ??
        1;
      this.view.scale.y =
        defaultStateAnimation.props.scale ??
        this.originalInnerViewState.scale ??
        1;
    }
  }

  protected setState(newState: State, force = false) {
    if (!force && this.state === newState) {
      return;
    }

    this.state = newState;

    this.playAnimations(newState);
  }

  protected playAnimations(state: State) {
    if (!this.animations) return;

    const stateAnimation = this.animations[state] ?? this.animations.default;

    if (stateAnimation) {
      const data = stateAnimation;

      this.defaultDuration = data.duration ?? this.defaultDuration;

      gsap.to(this.view, {
        pixi: {
          ...data.props,
        },
        duration: data.duration,
      });

      return;
    }

    gsap.to(this.view, {
      pixi: {
        ...this.originalInnerViewState,
      },
      duration: this.defaultDuration,
    });
  }
}
