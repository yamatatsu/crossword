import { useCrossword } from "@/hooks/useCrossword";
import type { PuzzleData } from "@/types/crossword";
import { ClueList } from "./ClueList";
import { CrosswordGrid } from "./CrosswordGrid";
import { CrosswordToolbar } from "./CrosswordToolbar";

type Props = {
	puzzle: PuzzleData;
};

export function CrosswordPage({ puzzle }: Props) {
	const {
		state,
		clues,
		setCell,
		deleteCell,
		selectCell,
		selectClue,
		move,
		checkWord,
		checkPuzzle,
		revealWord,
		reset,
	} = useCrossword(puzzle);

	return (
		<div className="flex flex-col gap-6">
			{state.completed && (
				<div className="rounded-lg bg-green-100 px-4 py-3 text-green-800 font-semibold">
					Congratulations! You completed the puzzle!
				</div>
			)}

			<div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
				<div className="flex flex-col gap-4">
					<CrosswordGrid
						state={state}
						onSelectCell={selectCell}
						onSetCell={setCell}
						onDeleteCell={deleteCell}
						onMove={move}
					/>
					<CrosswordToolbar
						onCheckWord={checkWord}
						onCheckPuzzle={checkPuzzle}
						onRevealWord={revealWord}
						onReset={reset}
						hasSelection={state.selectedClueId !== null}
					/>
				</div>

				<ClueList
					clues={clues}
					selectedClueId={state.selectedClueId}
					selectedDirection={state.selectedDirection}
					onSelectClue={selectClue}
				/>
			</div>
		</div>
	);
}
