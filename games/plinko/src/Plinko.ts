import { Container } from "pixi.js";
import gsap from "gsap";
import { GameController, Layout } from "@falkura-pet/engine";
import { Board } from "./game/Board";
import { Ball } from "./game/Ball";
import { PhysicsWorld } from "./game/PhysicsWorld";
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
  private physics: PhysicsWorld;
  private server: PlinkoServer = new FakePlinkoServer();
  private currentDifficulty: Difficulty;
  private currentRows: Rows;

  public start() {
    this.physics = new PhysicsWorld();

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
    this.ticker.add(this.tick, this);
  }

  public reset() {
    this.balls.forEach((b) => b.destroy());
    this.balls = [];
    if (this.physics) this.physics.rebuild(this.board.layout);
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
    const boardW = 950;
    const boardH = 900;

    this.board.build({
      rows: this.currentRows,
      width: boardW,
      height: boardH,
      gradient: DIFFICULTY_GRADIENT[this.currentDifficulty],
    });

    const multipliers = getMultipliers(
      this.currentDifficulty,
      this.currentRows,
    );

    this.board.renderBins(multipliers, () => {});

    this.physics.rebuild(this.board.layout);

    this.boardWrapper.x = (Layout.screen.width - boardW) / 2;
    this.boardWrapper.y = Layout.game.fromTop(250);
  }

  private async handleDropRequest() {
    const state = usePlinkoStore.getState();
    if (state.balance < state.bet) return;

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

    const physBody = this.physics.spawnBall(response.bin, (bin) => {
      this.onBallLanded(ball, bin, response, state);
    });

    const ball = new Ball(physBody, this.board.layout.ballRadius);
    this.boardWrapper.addChildAt(ball, 0);
    this.balls.push(ball);
  }

  private onBallLanded(
    ball: Ball,
    bin: number,
    response: { bin: number; multiplier: number; payout: number },
    originalState: ReturnType<typeof usePlinkoStore.getState>,
  ) {
    ball.markDead();

    // Snap ball visual to center of bin
    const targetX = this.board.layout.binCenters[bin].x;
    ball.position.x = targetX;

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

    // Fade out and remove
    gsap.to(ball, {
      alpha: 0,
      duration: 0.35,
      delay: 0.1,
      onComplete: () => {
        this.balls = this.balls.filter((b) => b !== ball);
        if (!ball.destroyed) ball.destroy();
      },
    });
  }

  private tick = () => {
    const dt = Math.min(1 / 30, this.ticker.deltaMS / 1000);
    const substeps = 3;
    const sub = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      this.physics.step(sub);
    }

    // Sync visual balls to physics bodies
    for (const ball of this.balls) {
      if (ball.isAlive()) {
        ball.syncToBody();
      }
    }
  };
}
