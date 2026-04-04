import { describe, expect, it } from "vitest";
import type { PuzzleData } from "@/types/crossword";
import {
	type CrosswordAction,
	crosswordReducer,
	initializeState,
} from "../crosswordReducer";

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

function applyActions(
	puzzle: PuzzleData,
	actions: CrosswordAction[],
) {
	let state = initializeState(puzzle);
	for (const action of actions) {
		state = crosswordReducer(state, action);
	}
	return state;
}

describe("initializeState", () => {
	it("creates grid with correct dimensions", () => {
		const state = initializeState(testPuzzle);
		expect(state.grid).toHaveLength(5);
		expect(state.grid[0]).toHaveLength(5);
	});

	it("marks white cells for word positions", () => {
		const state = initializeState(testPuzzle);
		// CAT at (0,0)-(0,2) across
		expect(state.grid[0][0]).not.toBeNull();
		expect(state.grid[0][1]).not.toBeNull();
		expect(state.grid[0][2]).not.toBeNull();
		// CUP at (0,0)-(2,0) down
		expect(state.grid[1][0]).not.toBeNull();
		expect(state.grid[2][0]).not.toBeNull();
	});

	it("marks black cells where no words are", () => {
		const state = initializeState(testPuzzle);
		expect(state.grid[3][3]).toBeNull();
		expect(state.grid[4][4]).toBeNull();
	});

	it("initializes with no selection and not completed", () => {
		const state = initializeState(testPuzzle);
		expect(state.selectedCell).toBeNull();
		expect(state.selectedDirection).toBe("across");
		expect(state.selectedClueId).toBeNull();
		expect(state.completed).toBe(false);
	});
});

describe("SET_CELL", () => {
	it("places a letter in a cell", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
		]);
		expect(state.grid[0][0]?.letter).toBe("C");
	});

	it("converts letter to uppercase", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SET_CELL", row: 0, col: 0, letter: "c" },
		]);
		expect(state.grid[0][0]?.letter).toBe("C");
	});

	it("advances to next cell in current direction", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
		]);
		expect(state.selectedCell).toEqual({ row: 0, col: 1 });
	});

	it("ignores SET_CELL on black cells", () => {
		const state = initializeState(testPuzzle);
		const newState = crosswordReducer(state, {
			type: "SET_CELL",
			row: 4,
			col: 4,
			letter: "X",
		});
		expect(newState.grid[4][4]).toBeNull();
	});

	it("detects completion when all cells correct", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			{ type: "SET_CELL", row: 0, col: 1, letter: "A" },
			{ type: "SET_CELL", row: 0, col: 2, letter: "T" },
			{ type: "SET_CELL", row: 1, col: 0, letter: "U" },
			{ type: "SET_CELL", row: 2, col: 0, letter: "P" },
			{ type: "SET_CELL", row: 1, col: 1, letter: "P" },
			{ type: "SET_CELL", row: 2, col: 1, letter: "E" },
		]);
		expect(state.completed).toBe(true);
	});
});

describe("DELETE_CELL", () => {
	it("clears the current cell letter", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "DELETE_CELL" },
		]);
		expect(state.grid[0][0]?.letter).toBe("");
	});

	it("moves back and clears when cell already empty", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			// Now at (0,1) which is empty
			{ type: "DELETE_CELL" },
		]);
		// Should have moved back to (0,0) and cleared it
		expect(state.selectedCell).toEqual({ row: 0, col: 0 });
		expect(state.grid[0][0]?.letter).toBe("");
	});
});

describe("SELECT_CELL", () => {
	it("selects a white cell", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 1 },
		]);
		expect(state.selectedCell).toEqual({ row: 0, col: 1 });
	});

	it("ignores selection of black cells", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 4, col: 4 },
		]);
		expect(state.selectedCell).toBeNull();
	});

	it("toggles direction when clicking same cell", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SELECT_CELL", row: 0, col: 0 },
		]);
		expect(state.selectedDirection).toBe("down");
	});

	it("sets the clue id for the selected word", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
		]);
		expect(state.selectedClueId).toBe(1); // CAT across
	});
});

describe("SELECT_CLUE", () => {
	it("selects the first cell of the clue word", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CLUE", clueId: 2, direction: "down" },
		]);
		expect(state.selectedCell).toEqual({ row: 0, col: 0 });
		expect(state.selectedDirection).toBe("down");
		expect(state.selectedClueId).toBe(2);
	});
});

describe("TOGGLE_DIRECTION", () => {
	it("switches from across to down", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "TOGGLE_DIRECTION" },
		]);
		expect(state.selectedDirection).toBe("down");
	});

	it("does nothing without a selected cell", () => {
		const state = applyActions(testPuzzle, [
			{ type: "TOGGLE_DIRECTION" },
		]);
		expect(state.selectedDirection).toBe("across");
	});
});

describe("MOVE", () => {
	it("moves selection in the given direction", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "MOVE", direction: "right" },
		]);
		expect(state.selectedCell).toEqual({ row: 0, col: 1 });
	});

	it("does not move into black cells", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 2 },
			{ type: "MOVE", direction: "right" },
		]);
		// (0,3) is a black cell, so stays at (0,2)
		expect(state.selectedCell).toEqual({ row: 0, col: 2 });
	});
});

describe("CHECK_WORD", () => {
	it("marks cells as correct or incorrect", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CELL", row: 0, col: 0 },
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			{ type: "SET_CELL", row: 0, col: 1, letter: "X" },
			{ type: "SELECT_CLUE", clueId: 1, direction: "across" },
			{ type: "CHECK_WORD" },
		]);
		expect(state.grid[0][0]?.checked).toBe(true);
		expect(state.grid[0][0]?.correct).toBe(true);
		expect(state.grid[0][1]?.checked).toBe(true);
		expect(state.grid[0][1]?.correct).toBe(false);
		// Empty cell not checked
		expect(state.grid[0][2]?.checked).toBe(false);
	});
});

describe("CHECK_PUZZLE", () => {
	it("marks all filled cells", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			{ type: "SET_CELL", row: 0, col: 1, letter: "A" },
			{ type: "SET_CELL", row: 0, col: 2, letter: "T" },
			{ type: "CHECK_PUZZLE" },
		]);
		expect(state.grid[0][0]?.correct).toBe(true);
		expect(state.grid[0][1]?.correct).toBe(true);
		expect(state.grid[0][2]?.correct).toBe(true);
	});
});

describe("REVEAL_WORD", () => {
	it("fills in the correct letters for selected word", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SELECT_CLUE", clueId: 1, direction: "across" },
			{ type: "REVEAL_WORD" },
		]);
		expect(state.grid[0][0]?.letter).toBe("C");
		expect(state.grid[0][1]?.letter).toBe("A");
		expect(state.grid[0][2]?.letter).toBe("T");
		expect(state.grid[0][0]?.revealed).toBe(true);
	});
});

describe("RESET", () => {
	it("clears all entered letters", () => {
		const state = applyActions(testPuzzle, [
			{ type: "SET_CELL", row: 0, col: 0, letter: "C" },
			{ type: "SET_CELL", row: 0, col: 1, letter: "A" },
			{ type: "RESET" },
		]);
		expect(state.grid[0][0]?.letter).toBe("");
		expect(state.grid[0][1]?.letter).toBe("");
		expect(state.completed).toBe(false);
	});
});
