import { Engine, GameController } from "@falkura-pet/engine";
import { BoardSystem } from "./systems/BoardSystem";
import { events, Events, GameMode, Difficulty } from "./events";
import { gameState } from "./state";
import {
  Board,
  WinInfo,
  createBoard,
  drop,
  dropRow,
  findWin,
  isFull,
} from "./logic/board";
import { pickAIMove, pickEasyMove } from "./logic/ai";

const AI_MOVE_DELAY_MS = 350;

const DIFFICULTY_DEPTH: Record<Exclude<Difficulty, "easy">, number> = {
  medium: 3,
  hard: 6,
};

export class Connect4 extends GameController {
  private board: Board = createBoard();
  private mode: GameMode = "ai";
  private difficulty: Difficulty = "medium";
  private currentPlayer: 1 | 2 = 1;
  private win: WinInfo | null = null;
  private busy = false;

  override init(): void {
    this.systems.add(BoardSystem);
    this.systems.disableAll();

    events.on(Events.StartRequested, this.onStartRequested, this);
    events.on(Events.ColumnSelected, this.onColumnSelected, this);
    events.on(Events.RestartRequested, this.onRestartRequested, this);
    events.on(Events.MenuRequested, this.onMenuRequested, this);
  }

  getBoard(): Board {
    return this.board;
  }

  getWinCells() {
    return this.win ? this.win.cells : null;
  }

  private onStartRequested({
    mode,
    difficulty,
  }: {
    mode: GameMode;
    difficulty: Difficulty;
  }) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.beginNewGame();
  }

  private onRestartRequested() {
    this.beginNewGame();
  }

  private onMenuRequested() {
    Engine.resetGame();
    this.systems.disableAll();
    gameState.reset();
  }

  private onColumnSelected({ col }: { col: number }) {
    if (this.busy || this.win) return;
    if (this.mode === "ai" && this.currentPlayer !== 1) return;
    void this.applyMove(col);
  }

  private beginNewGame() {
    Engine.resetGame();
    this.board = createBoard();
    this.win = null;
    this.currentPlayer = 1;

    this.systems.enable(BoardSystem);
    Engine.startGame();

    const board = this.systems.get(BoardSystem);
    board.setInteractive(true);

    gameState.set({
      screen: "playing",
      mode: this.mode,
      player: this.currentPlayer,
      winner: 0,
    });
  }

  private async applyMove(col: number) {
    const row = dropRow(this.board, col);
    if (row < 0) return;

    this.busy = true;
    const board = this.systems.get(BoardSystem);
    board.setInteractive(false);

    drop(this.board, col, this.currentPlayer);
    await board.dropDisc(row, col, this.currentPlayer);

    const win = findWin(this.board);
    if (win) {
      this.win = win;
      board.highlightWin(win.cells);
      gameState.set({ screen: "ended", winner: win.player });
      this.busy = false;
      return;
    }

    if (isFull(this.board)) {
      gameState.set({ screen: "ended", winner: 0 });
      this.busy = false;
      return;
    }

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    gameState.set({ player: this.currentPlayer });

    if (this.mode === "ai" && this.currentPlayer === 2) {
      this.busy = false;
      await this.runAITurn();
    } else {
      board.setInteractive(true);
      this.busy = false;
    }
  }

  private async runAITurn() {
    await new Promise((resolve) => setTimeout(resolve, AI_MOVE_DELAY_MS));
    const col =
      this.difficulty === "easy"
        ? pickEasyMove(this.board, 2)
        : pickAIMove(this.board, 2, DIFFICULTY_DEPTH[this.difficulty]);
    if (col < 0) return;
    await this.applyMove(col);
  }
}
