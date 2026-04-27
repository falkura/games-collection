import { Container, HTMLText } from "pixi.js";
import gsap from "gsap";
import { Engine, GameController, Layout } from "@falkura-pet/engine";
import { Board } from "./game/Board";
import { Ball } from "./game/Ball";
import {
  DIFFICULTY_GRADIENT,
  Difficulty,
  Rows,
  getMultipliers,
} from "./server/payouts";
import { FakePlinkoServer, PlinkoServer } from "./server/PlinkoServer";
import { plinkoEvents } from "./store/events";
import { usePlinkoStore } from "./store/store";

export class Plinko extends GameController {
  private board: Board;
  private boardWrapper: Container;
  private balls: Ball[] = [];
  private binLabels: HTMLText[] = [];
  private server: PlinkoServer = new FakePlinkoServer();
  private currentMultipliers: number[] = [];
  private currentDifficulty: Difficulty;
  private currentRows: Rows;

  public start() {
    this.boardWrapper = new Container();
    this.view.addChild(this.boardWrapper);

    this.board = new Board();
    this.boardWrapper.addChild(this.board);

    const state = usePlinkoStore.getState();
    this.currentDifficulty = state.difficulty;
    this.currentRows = state.rows;

    this.rebuildBoard();

    // React to UI changes that affect the board.
    usePlinkoStore.subscribe((s, prev) => {
      if (s.difficulty !== this.currentDifficulty || s.rows !== this.currentRows) {
        this.currentDifficulty = s.difficulty;
        this.currentRows = s.rows;
        this.rebuildBoard();
      }
    });

    plinkoEvents.on("plinko:drop-request", this.handleDropRequest, this);

    this.ticker.add(this.tick, this);
  }

  public reset() {
    this.balls.forEach((b) => b.destroy());
    this.balls = [];
  }

  public finish() {
    this.ticker.remove(this.tick, this);
    plinkoEvents.off("plinko:drop-request", this.handleDropRequest, this);
  }

  public resize() {
    if (!this.board) return;
    this.rebuildBoard();
  }

  private rebuildBoard() {
    // Available virtual area; mobile-first: tall board centered.
    const screenW = Layout.screenWidth;
    const screenH = Layout.screenHeight;

    // Reserve top for balance HUD, bottom for bet panel.
    const reservedTop = Layout.isPortrait ? 120 : 80;
    const reservedBottom = Layout.isPortrait ? 360 : 220;
    const reservedSide = Layout.isPortrait ? 16 : 320; // space for history on desktop

    const boardW = Math.min(screenW - reservedSide * 2, 720);
    const boardH = Math.max(
      300,
      Math.min(screenH - reservedTop - reservedBottom, 900),
    );

    this.board.build({
      rows: this.currentRows,
      width: boardW,
      height: boardH,
      gradient: DIFFICULTY_GRADIENT[this.currentDifficulty],
    });

    this.currentMultipliers = getMultipliers(
      this.currentDifficulty,
      this.currentRows,
    );

    this.binLabels.forEach((l) => l.destroy());
    this.binLabels = [];

    this.board.renderBins(this.currentMultipliers, (bins) => {
      bins.forEach((bin, i) => {
        const label = new HTMLText({
          text: `${this.currentMultipliers[i]}×`,
          style: {
            fontFamily: "system-ui, sans-serif",
            fontSize: Math.max(9, Math.min(13, 160 / this.currentRows)),
            fontWeight: "700",
            fill: "#0b0b14",
            align: "center",
          },
          resolution: Engine.textResolution,
        });
        label.anchor.set(0.5, 0.5);
        label.position.set(
          this.board.layout.binCenters[i].x,
          this.board.layout.binCenters[i].y + this.board.layout.binHeight / 2,
        );
        this.boardWrapper.addChild(label);
        this.binLabels.push(label);
      });
    });

    // Center board horizontally on the screen, anchor near top with reservedTop.
    this.boardWrapper.x = (screenW - boardW) / 2;
    this.boardWrapper.y = reservedTop;
  }

  private async handleDropRequest() {
    const state = usePlinkoStore.getState();
    if (state.balance < state.bet) return;

    state.subBalance(state.bet);
    state.incPending();

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let response;
    try {
      response = await this.server.drop({
        bet: state.bet,
        difficulty: state.difficulty,
        rows: state.rows,
        clientId,
      });
    } catch (e) {
      // Refund on server error and bail.
      state.addBalance(state.bet);
      state.decPending();
      return;
    }

    // If difficulty/rows changed mid-flight, ignore the server's bin (it was
    // for a now-stale board) — refund and skip.
    if (
      state.difficulty !== this.currentDifficulty ||
      state.rows !== this.currentRows
    ) {
      usePlinkoStore.getState().addBalance(state.bet);
      usePlinkoStore.getState().decPending();
      return;
    }

    const ball = new Ball({
      layout: this.board.layout,
      targetBin: response.bin,
      onLanded: (bin) => this.onBallLanded(bin, response, state),
    });
    this.boardWrapper.addChild(ball);
    this.balls.push(ball);
  }

  private onBallLanded(
    bin: number,
    response: { bin: number; multiplier: number; payout: number },
    state: ReturnType<typeof usePlinkoStore.getState>,
  ) {
    this.board.bumpBin(bin);
    plinkoEvents.emit("plinko:ball-landed", {
      bin,
      multiplier: response.multiplier,
    });

    const store = usePlinkoStore.getState();
    store.addBalance(response.payout);
    store.decPending();
    store.pushHistory({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bin,
      multiplier: response.multiplier,
      payout: response.payout,
      bet: state.bet,
      difficulty: state.difficulty,
      rows: state.rows,
      win: response.payout >= state.bet,
    });

    // Fade & remove ball after short delay.
    const ball = this.balls.find((b) => !b.isAlive());
    if (ball) {
      gsap.to(ball, {
        alpha: 0,
        duration: 0.4,
        delay: 0.15,
        onComplete: () => {
          this.balls = this.balls.filter((b) => b !== ball);
          ball.destroy();
        },
      });
    }
  }

  private tick = () => {
    const dt = Math.min(1 / 30, this.ticker.deltaMS / 1000);
    // Substep for stable collisions on small radius pegs.
    const substeps = 3;
    const sub = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      for (const b of this.balls) b.step(sub);
    }
  };
}
