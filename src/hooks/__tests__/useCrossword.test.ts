import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PuzzleData } from "@/types/crossword";
import { useCrossword } from "../useCrossword";

const testPuzzle: PuzzleData = {
	date: "2026-01-01",
	size: { rows: 5, cols: 5 },
	words: [
		{
			id: 1,
			word: "CAT",
			clue: "A small pet",
			row: 0,
			col: 0,
			direction: "across",
		},
		{
			id: 2,
			word: "CUP",
			clue: "You drink from it",
			row: 0,
			col: 0,
			direction: "down",
		},
		{
			id: 3,
			word: "APE",
			clue: "A primate",
			row: 0,
			col: 1,
			direction: "down",
		},
	],
};

describe("useCrossword", () => {
	it("initializes with correct state", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		expect(result.current.state.grid).toHaveLength(5);
		expect(result.current.state.completed).toBe(false);
		expect(result.current.state.selectedCell).toBeNull();
	});

	it("groups clues by direction", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		expect(result.current.clues.across).toHaveLength(1);
		expect(result.current.clues.down).toHaveLength(2);
		expect(result.current.clues.across[0].word).toBe("CAT");
	});

	it("selectCell updates selection", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() => result.current.selectCell(0, 0));
		expect(result.current.state.selectedCell).toEqual({ row: 0, col: 0 });
	});

	it("setCell places a letter", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() => result.current.selectCell(0, 0));
		act(() => result.current.setCell(0, 0, "C"));
		expect(result.current.state.grid[0][0]?.letter).toBe("C");
	});

	it("deleteCell clears current cell", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() => result.current.selectCell(0, 0));
		act(() => result.current.setCell(0, 0, "C"));
		act(() => result.current.selectCell(0, 0));
		act(() => result.current.deleteCell());
		expect(result.current.state.grid[0][0]?.letter).toBe("");
	});

	it("reset clears all cells", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() => result.current.setCell(0, 0, "C"));
		act(() => result.current.setCell(0, 1, "A"));
		act(() => result.current.reset());
		expect(result.current.state.grid[0][0]?.letter).toBe("");
		expect(result.current.state.grid[0][1]?.letter).toBe("");
	});

	it("checkPuzzle marks all filled cells", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() => result.current.setCell(0, 0, "C"));
		act(() => result.current.setCell(0, 1, "X"));
		act(() => result.current.checkPuzzle());
		expect(result.current.state.grid[0][0]?.correct).toBe(true);
		expect(result.current.state.grid[0][1]?.correct).toBe(false);
	});

	it("revealWord fills in correct letters", () => {
		const { result } = renderHook(() => useCrossword(testPuzzle));
		act(() =>
			result.current.selectClue(1, "across"),
		);
		act(() => result.current.revealWord());
		expect(result.current.state.grid[0][0]?.letter).toBe("C");
		expect(result.current.state.grid[0][1]?.letter).toBe("A");
		expect(result.current.state.grid[0][2]?.letter).toBe("T");
	});
});
