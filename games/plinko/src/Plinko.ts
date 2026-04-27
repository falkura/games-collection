import { Container } from "pixi.js";
import gsap from "gsap";
import { GameController, Layout } from "@falkura-pet/engine";
import { Board } from "./game/Board";
import { Ball } from "./game/Ball";
import { BALL_CONFIG } from "./game/ballConfig";
import {
  DIFFICULTY_GRADIENT,
  Difficulty,
  Rows,
  getMultipliers,
} from "./server/payouts";
import {
  FakePlinkoServer,
  PlinkoServer,
  setPlinkoServer,
} from "./server/PlinkoServer";
import { plinkoEvents } from "./store/events";
import { usePlinkoStore } from "./store/store";
import "./Audio";

export class Plinko extends GameController {
  private board: Board;
  private boardWrapper: Container;
  private balls: Ball[] = [];
  private server: PlinkoServer = (() => {
    const s = new FakePlinkoServer();
    setPlinkoServer(s);
    return s;
  })();

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

    usePlinkoStore.subscribe((s) => {
      if (
        s.difficulty !== this.currentDifficulty ||
        s.rows !== this.currentRows
      ) {
        this.currentDifficulty = s.difficulty;
        this.currentRows = s.rows;
        this.rebuildBoard();
      }
    });

    plinkoEvents.on("plinko:drop-request", this.handleDropRequest, this);
  }

  public reset() {
    this.balls.forEach((b) => b.destroy());
    this.balls = [];
  }

  public finish() {
    plinkoEvents.off("plinko:drop-request", this.handleDropRequest, this);
  }

  public resize() {
    if (!this.board) return;
    this.scaleBoardToScreen();
  }

  private static readonly BOARD_W = 950;
  private static readonly BOARD_H = 900;

  private rebuildBoard() {
    // Kill and remove all in-flight balls before destroying board geometry
    for (const ball of this.balls) {
      ball.markDead();
      if (!ball.destroyed) ball.destroy();
    }
    this.balls = [];

    this.board.build({
      rows: this.currentRows,
      width: Plinko.BOARD_W,
      height: Plinko.BOARD_H,
      gradient: DIFFICULTY_GRADIENT[this.currentDifficulty],
    });

    this.board.renderBins(
      getMultipliers(this.currentDifficulty, this.currentRows),
      () => {},
    );

    this.scaleBoardToScreen();
  }

  private scaleBoardToScreen() {
    const screenW = Layout.screen.width;
    const screenH = Layout.screen.height;

    // Leave room for the UI panels (top bar ~60px, bottom panel ~230px)
    const availW = screenW;
    const availH = screenH - 290;

    const scale = Math.min(availW / Plinko.BOARD_W, availH / Plinko.BOARD_H, 1);

    this.boardWrapper.scale.set(scale);
    this.boardWrapper.x = (screenW - Plinko.BOARD_W * scale) / 2;
    this.boardWrapper.y = Layout.game.fromTop(250);
  }

  private async handleDropRequest() {
    const state = usePlinkoStore.getState();
    if (state.balance < state.bet) return;
    if (this.balls.length >= BALL_CONFIG.maxActiveBalls) return;

    state.subBalance(state.bet);
    state.incPending();

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const dropDifficulty = state.difficulty;
    const dropRows = state.rows;

    let response;
    try {
      response = await this.server.drop({
        bet: state.bet,
        difficulty: dropDifficulty,
        rows: dropRows,
        clientId,
      });
    } catch {
      usePlinkoStore.getState().addBalance(state.bet);
      usePlinkoStore.getState().decPending();
      return;
    }

    // Board changed mid-flight — refund
    if (
      dropDifficulty !== this.currentDifficulty ||
      dropRows !== this.currentRows
    ) {
      usePlinkoStore.getState().addBalance(state.bet);
      usePlinkoStore.getState().decPending();
      return;
    }

    const ball = new Ball(this.board.layout.ballRadius);
    this.boardWrapper.addChildAt(ball, 0);
    this.balls.push(ball);

    ball.animate(this.board.layout, response.path, (bin) => {
      this.onBallLanded(ball, bin, response, state);
    });
  }

  private onBallLanded(
    ball: Ball,
    bin: number,
    response: { bin: number; multiplier: number; payout: number },
    originalState: ReturnType<typeof usePlinkoStore.getState>,
  ) {
    ball.markDead();

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
      bet: originalState.bet,
      difficulty: originalState.difficulty,
      rows: originalState.rows,
      win: response.payout >= originalState.bet,
    });

    if (ball.destroyed) return;
    gsap.to(ball, {
      alpha: 0,
      duration: BALL_CONFIG.fadeDuration,
      onComplete: () => {
        this.balls = this.balls.filter((b) => b !== ball);
        if (!ball.destroyed) ball.destroy();
      },
    });
  }
}
