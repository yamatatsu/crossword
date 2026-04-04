import { readFileSync } from "fs";
import type { PuzzleData, WordPlacement } from "../src/types/crossword";

function getCellsForWord(
	word: WordPlacement,
): { row: number; col: number; letter: string }[] {
	const cells: { row: number; col: number; letter: string }[] = [];
	for (let i = 0; i < word.word.length; i++) {
		cells.push({
			row: word.direction === "down" ? word.row + i : word.row,
			col: word.direction === "across" ? word.col + i : word.col,
			letter: word.word[i],
		});
	}
	return cells;
}

function validate(puzzle: PuzzleData): string[] {
	const errors: string[] = [];

	if (!puzzle.date || !/^\d{4}-\d{2}-\d{2}$/.test(puzzle.date)) {
		errors.push("Invalid date format, expected YYYY-MM-DD");
	}

	if (
		!puzzle.size ||
		puzzle.size.rows < 1 ||
		puzzle.size.cols < 1 ||
		puzzle.size.rows > 15 ||
		puzzle.size.cols > 15
	) {
		errors.push("Grid size must be between 1x1 and 15x15");
	}

	if (puzzle.words.length < 5 || puzzle.words.length > 20) {
		errors.push(
			`Expected 5-20 words, got ${puzzle.words.length}`,
		);
	}

	const letterGrid = new Map<string, string>();

	for (const word of puzzle.words) {
		if (word.word.length < 3) {
			errors.push(`Word "${word.word}" is too short (min 3 letters)`);
		}

		if (word.word !== word.word.toUpperCase()) {
			errors.push(`Word "${word.word}" must be uppercase`);
		}

		const cells = getCellsForWord(word);
		for (const cell of cells) {
			if (
				cell.row < 0 ||
				cell.row >= puzzle.size.rows ||
				cell.col < 0 ||
				cell.col >= puzzle.size.cols
			) {
				errors.push(
					`Word "${word.word}" goes out of bounds at (${cell.row},${cell.col})`,
				);
				continue;
			}

			const key = `${cell.row},${cell.col}`;
			const existing = letterGrid.get(key);
			if (existing && existing !== cell.letter) {
				errors.push(
					`Intersection conflict at (${cell.row},${cell.col}): "${existing}" vs "${cell.letter}" in word "${word.word}"`,
				);
			}
			letterGrid.set(key, cell.letter);
		}
	}

	return errors;
}

const filePath = process.argv[2];
if (!filePath) {
	console.error("Usage: bun run scripts/validate-puzzle.ts <puzzle.json>");
	process.exit(1);
}

const raw = readFileSync(filePath, "utf-8");
const puzzle: PuzzleData = JSON.parse(raw);
const errors = validate(puzzle);

if (errors.length > 0) {
	console.error("Validation errors:");
	for (const e of errors) {
		console.error(`  - ${e}`);
	}
	process.exit(1);
}

console.log(`Puzzle "${puzzle.date}" is valid (${puzzle.words.length} words)`);
