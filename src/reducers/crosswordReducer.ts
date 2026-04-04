import {
	buildSolution,
	getCellsForWord,
	getNextCell,
	getPrevCell,
	getWordAtCell,
} from "@/lib/crossword";
import type {
	CellState,
	CrosswordState,
	Direction,
	PuzzleData,
} from "@/types/crossword";

export type CrosswordAction =
	| { type: "SET_CELL"; row: number; col: number; letter: string }
	| { type: "DELETE_CELL" }
	| { type: "SELECT_CELL"; row: number; col: number }
	| { type: "SELECT_CLUE"; clueId: number; direction: Direction }
	| { type: "TOGGLE_DIRECTION" }
	| { type: "MOVE"; direction: "up" | "down" | "left" | "right" }
	| { type: "CHECK_WORD" }
	| { type: "CHECK_PUZZLE" }
	| { type: "REVEAL_WORD" }
	| { type: "RESET" };

export function initializeState(puzzle: PuzzleData): CrosswordState {
	const grid: (CellState | null)[][] = Array.from(
		{ length: puzzle.size.rows },
		() => Array.from({ length: puzzle.size.cols }, () => null),
	);

	const solution = buildSolution(puzzle);
	for (const key of solution.keys()) {
		const [row, col] = key.split(",").map(Number);
		grid[row][col] = {
			letter: "",
			revealed: false,
			checked: false,
			correct: null,
		};
	}

	return {
		puzzle,
		grid,
		selectedCell: null,
		selectedDirection: "across",
		selectedClueId: null,
		completed: false,
	};
}

function checkCompletion(state: CrosswordState): boolean {
	const solution = buildSolution(state.puzzle);
	for (const [key, letter] of solution) {
		const [row, col] = key.split(",").map(Number);
		const cell = state.grid[row][col];
		if (!cell || cell.letter !== letter) return false;
	}
	return true;
}

function selectCellAndClue(
	state: CrosswordState,
	row: number,
	col: number,
	direction: Direction,
): CrosswordState {
	const word = getWordAtCell(state, row, col, direction);
	// If no word found in this direction, try the other direction
	const actualDirection = word
		? direction
		: direction === "across"
			? "down"
			: "across";
	const actualWord =
		word ?? getWordAtCell(state, row, col, actualDirection);

	return {
		...state,
		selectedCell: { row, col },
		selectedDirection: actualDirection,
		selectedClueId: actualWord?.id ?? null,
	};
}

export function crosswordReducer(
	state: CrosswordState,
	action: CrosswordAction,
): CrosswordState {
	switch (action.type) {
		case "SET_CELL": {
			const { row, col, letter } = action;
			const cell = state.grid[row][col];
			if (!cell) return state;

			const newGrid = state.grid.map((r) => [...r]);
			newGrid[row][col] = {
				...cell,
				letter: letter.toUpperCase(),
				checked: false,
				correct: null,
			};

			const next = getNextCell(state, row, col, state.selectedDirection);
			const newState: CrosswordState = {
				...state,
				grid: newGrid,
				selectedCell: next ?? state.selectedCell,
			};
			newState.completed = checkCompletion(newState);
			return newState;
		}

		case "DELETE_CELL": {
			if (!state.selectedCell) return state;
			const { row, col } = state.selectedCell;
			const cell = state.grid[row][col];
			if (!cell) return state;

			if (cell.letter === "") {
				// If cell is already empty, move back
				const prev = getPrevCell(
					state,
					row,
					col,
					state.selectedDirection,
				);
				if (!prev) return state;
				const prevCell = state.grid[prev.row][prev.col];
				if (!prevCell) return state;

				const newGrid = state.grid.map((r) => [...r]);
				newGrid[prev.row][prev.col] = {
					...prevCell,
					letter: "",
					checked: false,
					correct: null,
				};
				return {
					...state,
					grid: newGrid,
					selectedCell: prev,
					completed: false,
				};
			}

			const newGrid = state.grid.map((r) => [...r]);
			newGrid[row][col] = {
				...cell,
				letter: "",
				checked: false,
				correct: null,
			};
			return { ...state, grid: newGrid, completed: false };
		}

		case "SELECT_CELL": {
			const { row, col } = action;
			if (state.grid[row][col] === null) return state;

			// If clicking same cell, toggle direction
			if (
				state.selectedCell?.row === row &&
				state.selectedCell?.col === col
			) {
				const newDirection: Direction =
					state.selectedDirection === "across" ? "down" : "across";
				return selectCellAndClue(state, row, col, newDirection);
			}

			return selectCellAndClue(state, row, col, state.selectedDirection);
		}

		case "SELECT_CLUE": {
			const word = state.puzzle.words.find(
				(w) =>
					w.id === action.clueId && w.direction === action.direction,
			);
			if (!word) return state;
			return {
				...state,
				selectedCell: { row: word.row, col: word.col },
				selectedDirection: action.direction,
				selectedClueId: action.clueId,
			};
		}

		case "TOGGLE_DIRECTION": {
			if (!state.selectedCell) return state;
			const newDir: Direction =
				state.selectedDirection === "across" ? "down" : "across";
			return selectCellAndClue(
				state,
				state.selectedCell.row,
				state.selectedCell.col,
				newDir,
			);
		}

		case "MOVE": {
			if (!state.selectedCell) return state;
			const { row, col } = state.selectedCell;
			let nr = row;
			let nc = col;
			switch (action.direction) {
				case "up":
					nr = Math.max(0, row - 1);
					break;
				case "down":
					nr = Math.min(state.puzzle.size.rows - 1, row + 1);
					break;
				case "left":
					nc = Math.max(0, col - 1);
					break;
				case "right":
					nc = Math.min(state.puzzle.size.cols - 1, col + 1);
					break;
			}
			if (state.grid[nr][nc] === null) return state;
			return { ...state, selectedCell: { row: nr, col: nc } };
		}

		case "CHECK_WORD": {
			if (state.selectedClueId === null) return state;
			const word = state.puzzle.words.find(
				(w) =>
					w.id === state.selectedClueId &&
					w.direction === state.selectedDirection,
			);
			if (!word) return state;

			const solution = buildSolution(state.puzzle);
			const newGrid = state.grid.map((r) => [...r]);
			const cells = getCellsForWord(word);
			for (const { row, col } of cells) {
				const cell = newGrid[row][col];
				if (cell && cell.letter !== "") {
					newGrid[row][col] = {
						...cell,
						checked: true,
						correct:
							cell.letter === solution.get(`${row},${col}`),
					};
				}
			}
			return { ...state, grid: newGrid };
		}

		case "CHECK_PUZZLE": {
			const solution = buildSolution(state.puzzle);
			const newGrid = state.grid.map((r) => [...r]);
			for (const [key, letter] of solution) {
				const [row, col] = key.split(",").map(Number);
				const cell = newGrid[row][col];
				if (cell && cell.letter !== "") {
					newGrid[row][col] = {
						...cell,
						checked: true,
						correct: cell.letter === letter,
					};
				}
			}
			return { ...state, grid: newGrid };
		}

		case "REVEAL_WORD": {
			if (state.selectedClueId === null) return state;
			const word = state.puzzle.words.find(
				(w) =>
					w.id === state.selectedClueId &&
					w.direction === state.selectedDirection,
			);
			if (!word) return state;

			const solution = buildSolution(state.puzzle);
			const newGrid = state.grid.map((r) => [...r]);
			const cells = getCellsForWord(word);
			for (const { row, col } of cells) {
				const cell = newGrid[row][col];
				if (cell) {
					newGrid[row][col] = {
						...cell,
						letter: solution.get(`${row},${col}`) ?? "",
						revealed: true,
						checked: false,
						correct: null,
					};
				}
			}
			const newState = { ...state, grid: newGrid };
			newState.completed = checkCompletion(newState);
			return newState;
		}

		case "RESET": {
			const newGrid = state.grid.map((r) =>
				r.map((cell) =>
					cell
						? {
								letter: "",
								revealed: false,
								checked: false,
								correct: null,
							}
						: null,
				),
			);
			return { ...state, grid: newGrid, completed: false };
		}

		default:
			return state;
	}
}
