import { Engine, GameController } from "@falkura-pet/engine";
import { BoardSystem } from "./systems/BoardSystem";
import { events, Events, Mark, PuzzleConfig } from "./events";
import { gameState } from "./state";
import {
  Puzzle,
  computeAutoCrosses,
  emptyMarks,
  findConflicts,
  generatePuzzle,
  isSolved,
} from "./logic/puzzle";
import { SystemController } from "./systems/SystemController";
import { Container } from "pixi.js";

export class StarBattle extends GameController {
  private puzzle: Puzzle | null = null;
  private marks: Mark[][] = [];
  private puzzleConfig: PuzzleConfig = { size: 6, starsPer: 1 };
  private elapsed = 0;
  private timerActive = false;

  systems: SystemController;

  constructor(config: IGameConfig, view: Container) {
    super(config, view);
    this.systems = new SystemController(this);

    this.systems.add(BoardSystem);
    this.systems.disableAll();

    events.on(Events.StartRequested, this.onStartRequested, this);
    events.on(Events.RestartRequested, this.onRestartRequested, this);
    events.on(Events.NewPuzzleRequested, this.onNewPuzzleRequested, this);
    events.on(Events.MenuRequested, this.onMenuRequested, this);
    events.on(Events.CellTapped, this.onCellTapped, this);
    events.on(Events.PauseToggleRequested, this.onPauseToggle, this);

    this.ticker.add((ticker) => {
      if (!this.timerActive) return;
      this.elapsed += ticker.deltaMS / 1000;
      const next = Math.floor(this.elapsed);
      if (next !== gameState.get().elapsed) {
        gameState.set({ elapsed: next });
      }
    });

    this.systems.build();
    this.ticker.add((ticker) => this.systems.tick(ticker));
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

  getRegions(): number[][] {
    return this.puzzle ? this.puzzle.regions : [];
  }

  private onStartRequested(cfg: PuzzleConfig) {
    this.puzzleConfig = cfg;
    this.beginNewPuzzle(true);
  }

  private onRestartRequested() {
    if (!this.puzzle) return;
    this.marks = emptyMarks(this.puzzle.size);
    this.elapsed = 0;
    this.timerActive = true;
    const board = this.systems.get(BoardSystem);
    board.loadPuzzle(this.puzzle.size);
    board.setInteractive(true);
    board.showConflicts(new Set());
    gameState.set({
      screen: "playing",
      stars: 0,
      starsTotal: this.puzzle.size * this.puzzle.starsPer,
      elapsed: 0,
      paused: false,
    });
    board.setHidden(false);
  }

  private onNewPuzzleRequested() {
    this.beginNewPuzzle(false);
  }

  private onMenuRequested() {
    Engine.resetGame();
    this.systems.disableAll();
    this.timerActive = false;
    gameState.reset();
  }

  private onPauseToggle() {
    if (!this.puzzle) return;
    if (gameState.get().screen !== "playing") return;
    const next = !gameState.get().paused;
    gameState.set({ paused: next });
    this.timerActive = !next;
    const board = this.systems.get(BoardSystem);
    board.setInteractive(!next);
    board.setHidden(next);
  }

  private onCellTapped({ row, col }: { row: number; col: number }) {
    if (!this.puzzle) return;
    if (gameState.get().paused) return;
    const current = this.marks[row][col];
    const { regions, starsPer } = this.puzzle;
    const autoCells = computeAutoCrosses(this.marks, regions, starsPer);
    const isAutoCross = current === 0 && autoCells.has(`${row},${col}`);
    // Auto-cross cells skip manual cross and go straight to star.
    const next: Mark = isAutoCross ? 2 : current === 0 ? 1 : current === 1 ? 2 : 0;
    this.marks[row][col] = next;

    this.refreshBoard();

    if (isSolved(this.marks, this.puzzle.regions, this.puzzle.starsPer)) {
      void this.handleWin();
    }
  }

  /** Push the current user marks + computed auto-crosses to the board. */
  private refreshBoard() {
    if (!this.puzzle) return;
    const board = this.systems.get(BoardSystem);
    const { regions, starsPer } = this.puzzle;

    // Auto-crosses are added on top of user marks where the user hasn't
    // placed anything (don't overwrite a user's manual cross or a star).
    const autoCells = computeAutoCrosses(this.marks, regions, starsPer);
    const display: Mark[][] = this.marks.map((row) => row.slice() as Mark[]);
    for (const k of autoCells) {
      const [rs, cs] = k.split(",");
      const r = Number(rs);
      const c = Number(cs);
      if (display[r][c] === 0) display[r][c] = 1;
    }

    const conflicts = findConflicts(this.marks, regions, starsPer);
    board.setMarks(display, conflicts);
    board.showConflicts(conflicts, this.marks);

    gameState.set({ stars: this.countStars() });
  }

  private async handleWin() {
    this.timerActive = false;
    const board = this.systems.get(BoardSystem);
    board.setInteractive(false);
    // Wait for the last star's appear animation to finish before celebrating.
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    await board.playWinAnimation();
    gameState.set({ screen: "ended" });
  }

  private beginNewPuzzle(fromMenu: boolean) {
    if (fromMenu) {
      Engine.resetGame();
      this.systems.enable(BoardSystem);
      Engine.startGame();
    }
    this.puzzle = generatePuzzle(
      this.puzzleConfig.size,
      this.puzzleConfig.starsPer,
    );
    this.marks = emptyMarks(this.puzzle.size);
    this.elapsed = 0;
    this.timerActive = true;

    const board = this.systems.get(BoardSystem);
    board.loadPuzzle(this.puzzle.size);
    board.setInteractive(true);
    board.showConflicts(new Set());

    gameState.set({
      screen: "playing",
      size: this.puzzleConfig.size,
      starsPer: this.puzzleConfig.starsPer,
      stars: 0,
      starsTotal: this.puzzle.size * this.puzzle.starsPer,
      elapsed: 0,
      paused: false,
    });
    board.setHidden(false);
  }

  private countStars(): number {
    let n = 0;
    for (const row of this.marks) for (const m of row) if (m === 2) n++;
    return n;
  }
}
