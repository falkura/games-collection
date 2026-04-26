import { Engine, GameController } from "@falkura-pet/engine";
import { MainSystem } from "./systems/MainSystem";
import { IntroSystem } from "./systems/IntroSystem";
import { Container } from "pixi.js";
import { SystemController } from "./systems/SystemController";

const GAMEPLAY_SYSTEMS = [MainSystem];

export class BoidsSimulation extends GameController {
  systems: SystemController;

  constructor(config: IGameConfig, view: Container) {
    super(config, view);

    this.systems = new SystemController(this);

    this.systems.add(IntroSystem);
    this.systems.add(MainSystem);

    this.systems.disableAll();
    this.systems.enable(IntroSystem);

    this.systems.build();
    this.ticker.add((ticker) => this.systems.tick(ticker));
  }

  onPlay() {
    this.systems.disable(IntroSystem);
    for (const id of GAMEPLAY_SYSTEMS) this.systems.enable(id);
    Engine.startGame();
  }

  public start() {
    super.start();
    this.systems.start();
  }

  public finish(data: any) {
    super.finish(data);
    this.systems.finish(data);
  }

  public reset() {
    super.reset();
    this.systems.reset();
  }

  public resize() {
    super.resize();
    this.systems.resize();
  }
}
