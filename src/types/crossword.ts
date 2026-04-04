export type Direction = "across" | "down";

export type WordPlacement = {
  id: number;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
};

export type PuzzleData = {
  date: string;
  size: { rows: number; cols: number };
  words: WordPlacement[];
};

export type CellState = {
  letter: string;
  revealed: boolean;
  checked: boolean;
  correct: boolean | null;
};

export type CellPosition = {
  row: number;
  col: number;
};

export type CrosswordState = {
  puzzle: PuzzleData;
  grid: (CellState | null)[][];
  selectedCell: CellPosition | null;
  selectedDirection: Direction;
  selectedClueId: number | null;
  completed: boolean;
};
