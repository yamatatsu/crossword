import { useCallback, useEffect, useRef } from "react";
import { buildCellNumbers, getCellsForWord } from "@/lib/crossword";
import type { CrosswordState } from "@/types/crossword";

type Props = {
	state: CrosswordState;
	onSelectCell: (row: number, col: number) => void;
	onSetCell: (row: number, col: number, letter: string) => void;
	onDeleteCell: () => void;
	onMove: (action: { type: "MOVE"; direction: "up" | "down" | "left" | "right" }) => void;
};

const CELL_SIZE = 40;

function getSelectedWordCells(
	state: CrosswordState,
): Set<string> {
	const cells = new Set<string>();
	if (state.selectedClueId === null) return cells;
	const word = state.puzzle.words.find(
		(w) =>
			w.id === state.selectedClueId &&
			w.direction === state.selectedDirection,
	);
	if (!word) return cells;
	for (const c of getCellsForWord(word)) {
		cells.add(`${c.row},${c.col}`);
	}
	return cells;
}

function cellBgColor(
	row: number,
	col: number,
	state: CrosswordState,
	wordCells: Set<string>,
): string {
	const cell = state.grid[row][col];
	if (!cell) return "bg-primary";

	if (cell.checked && cell.correct === false) return "bg-red-200";
	if (cell.checked && cell.correct === true) return "bg-green-200";
	if (cell.revealed) return "bg-amber-100";

	const isSelected =
		state.selectedCell?.row === row && state.selectedCell?.col === col;
	if (isSelected) return "bg-blue-300";
	if (wordCells.has(`${row},${col}`)) return "bg-blue-100";

	return "bg-background";
}

export function CrosswordGrid({
	state,
	onSelectCell,
	onSetCell,
	onDeleteCell,
	onMove,
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const cellNumbers = buildCellNumbers(state.puzzle);
	const wordCells = getSelectedWordCells(state);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!state.selectedCell) return;

			if (e.key === "Backspace") {
				e.preventDefault();
				onDeleteCell();
				return;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				onMove({ type: "MOVE", direction: "up" });
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				onMove({ type: "MOVE", direction: "down" });
				return;
			}
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				onMove({ type: "MOVE", direction: "left" });
				return;
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				onMove({ type: "MOVE", direction: "right" });
				return;
			}

			if (/^[a-zA-Z]$/.test(e.key)) {
				e.preventDefault();
				onSetCell(
					state.selectedCell.row,
					state.selectedCell.col,
					e.key,
				);
			}
		},
		[state.selectedCell, onSetCell, onDeleteCell, onMove],
	);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("keydown", handleKeyDown);
		return () => el.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// Focus the grid when a cell is selected
	useEffect(() => {
		if (state.selectedCell && containerRef.current) {
			containerRef.current.focus();
		}
	}, [state.selectedCell]);

	const { rows, cols } = state.puzzle.size;

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			className="outline-none inline-block border-2 border-primary"
			data-testid="crossword-grid"
			style={{ lineHeight: 0 }}
		>
			{Array.from({ length: rows }, (_, row) => (
				<div key={row} className="flex">
					{Array.from({ length: cols }, (_, col) => {
						const cell = state.grid[row][col];
						const num = cellNumbers.get(`${row},${col}`);
						const bg = cellBgColor(row, col, state, wordCells);

						return (
							<div
								key={col}
								className={`relative border border-muted-foreground/30 ${bg} ${cell ? "cursor-pointer" : ""}`}
								style={{
									width: CELL_SIZE,
									height: CELL_SIZE,
								}}
								onClick={() =>
									cell && onSelectCell(row, col)
								}
								onKeyDown={() => {}}
							>
								{num && (
									<span className="absolute top-0 left-0.5 text-[10px] leading-tight text-muted-foreground">
										{num}
									</span>
								)}
								{cell && (
									<span className="flex items-center justify-center w-full h-full text-lg font-semibold">
										{cell.letter}
									</span>
								)}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
