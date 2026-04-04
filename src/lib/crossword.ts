import type {
	CellPosition,
	CrosswordState,
	Direction,
	PuzzleData,
	WordPlacement,
} from "@/types/crossword";

export function getCellsForWord(word: WordPlacement): CellPosition[] {
	const cells: CellPosition[] = [];
	for (let i = 0; i < word.word.length; i++) {
		cells.push({
			row: word.direction === "down" ? word.row + i : word.row,
			col: word.direction === "across" ? word.col + i : word.col,
		});
	}
	return cells;
}

export function buildSolution(puzzle: PuzzleData): Map<string, string> {
	const solution = new Map<string, string>();
	for (const word of puzzle.words) {
		const cells = getCellsForWord(word);
		for (let i = 0; i < cells.length; i++) {
			solution.set(`${cells[i].row},${cells[i].col}`, word.word[i]);
		}
	}
	return solution;
}

export function buildCellNumbers(puzzle: PuzzleData): Map<string, number> {
	const numbers = new Map<string, number>();
	for (const word of puzzle.words) {
		const key = `${word.row},${word.col}`;
		if (!numbers.has(key)) {
			numbers.set(key, word.id);
		}
	}
	return numbers;
}

export function getWordAtCell(
	state: CrosswordState,
	row: number,
	col: number,
	direction: Direction,
): WordPlacement | undefined {
	return state.puzzle.words.find((w) => {
		if (w.direction !== direction) return false;
		const cells = getCellsForWord(w);
		return cells.some((c) => c.row === row && c.col === col);
	});
}

export function getNextCell(
	state: CrosswordState,
	row: number,
	col: number,
	direction: Direction,
): CellPosition | null {
	const nr = direction === "down" ? row + 1 : row;
	const nc = direction === "across" ? col + 1 : col;
	if (
		nr >= state.puzzle.size.rows ||
		nc >= state.puzzle.size.cols ||
		state.grid[nr][nc] === null
	) {
		return null;
	}
	return { row: nr, col: nc };
}

export function getPrevCell(
	state: CrosswordState,
	row: number,
	col: number,
	direction: Direction,
): CellPosition | null {
	const nr = direction === "down" ? row - 1 : row;
	const nc = direction === "across" ? col - 1 : col;
	if (nr < 0 || nc < 0 || state.grid[nr][nc] === null) {
		return null;
	}
	return { row: nr, col: nc };
}
