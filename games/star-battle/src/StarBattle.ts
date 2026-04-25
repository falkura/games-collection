import { Engine, GameController } from "@falkura-pet/engine";
import { BoardSystem } from "./systems/BoardSystem";
import { events, Events, Mark, PuzzleConfig } from "./events";
import { gameState } from "./state";
import {
  Puzzle,
  emptyMarks,
  findConflicts,
  generatePuzzle,
  isSolved,
} from "./logic/puzzle";

export class StarBattle extends GameController {
  private puzzle: Puzzle | null = null;
  private marks: Mark[][] = [];
  private puzzleConfig: PuzzleConfig = { size: 6, starsPer: 1 };
  private elapsed = 0;
  private timerActive = false;

  override init(): void {
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
    const next: Mark = current === 0 ? 1 : current === 1 ? 2 : 0;
    this.marks[row][col] = next;
    void this.systems.get(BoardSystem).setMark(row, col, next);

    const conflicts = findConflicts(
      this.marks,
      this.puzzle.regions,
      this.puzzle.starsPer,
    );
    this.systems.get(BoardSystem).showConflicts(conflicts);

    const stars = this.countStars();
    gameState.set({ stars });

    if (isSolved(this.marks, this.puzzle.regions, this.puzzle.starsPer)) {
      void this.handleWin();
    }
  }

  private async handleWin() {
    this.timerActive = false;
    this.systems.get(BoardSystem).setInteractive(false);
    await this.systems.get(BoardSystem).playWinAnimation();
    gameState.set({ screen: "ended" });
  }

  private beginNewPuzzle(fromMenu: boolean) {
    if (fromMenu) {
      Engine.resetGame();
      this.systems.enable(BoardSystem);
      Engine.startGame();
    }
    this.puzzle = generatePuzzle(this.puzzleConfig.size, this.puzzleConfig.starsPer);
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
