import { useCallback, useMemo, useReducer } from "react";
import {
	type CrosswordAction,
	crosswordReducer,
	initializeState,
} from "@/reducers/crosswordReducer";
import type { Direction, PuzzleData } from "@/types/crossword";

export function useCrossword(puzzle: PuzzleData) {
	const [state, dispatch] = useReducer(
		crosswordReducer,
		puzzle,
		initializeState,
	);

	const setCell = useCallback(
		(row: number, col: number, letter: string) => {
			dispatch({ type: "SET_CELL", row, col, letter });
		},
		[],
	);

	const deleteCell = useCallback(() => {
		dispatch({ type: "DELETE_CELL" });
	}, []);

	const selectCell = useCallback((row: number, col: number) => {
		dispatch({ type: "SELECT_CELL", row, col });
	}, []);

	const selectClue = useCallback(
		(clueId: number, direction: Direction) => {
			dispatch({ type: "SELECT_CLUE", clueId, direction });
		},
		[],
	);

	const toggleDirection = useCallback(() => {
		dispatch({ type: "TOGGLE_DIRECTION" });
	}, []);

	const move = useCallback(
		(direction: CrosswordAction & { type: "MOVE" }) => {
			dispatch(direction);
		},
		[],
	);

	const checkWord = useCallback(() => {
		dispatch({ type: "CHECK_WORD" });
	}, []);

	const checkPuzzle = useCallback(() => {
		dispatch({ type: "CHECK_PUZZLE" });
	}, []);

	const revealWord = useCallback(() => {
		dispatch({ type: "REVEAL_WORD" });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	const clues = useMemo(
		() => ({
			across: state.puzzle.words
				.filter((w) => w.direction === "across")
				.sort((a, b) => a.id - b.id),
			down: state.puzzle.words
				.filter((w) => w.direction === "down")
				.sort((a, b) => a.id - b.id),
		}),
		[state.puzzle.words],
	);

	return {
		state,
		clues,
		setCell,
		deleteCell,
		selectCell,
		selectClue,
		toggleDirection,
		move,
		checkWord,
		checkPuzzle,
		revealWord,
		reset,
	};
}
