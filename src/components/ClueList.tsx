import type { Direction, WordPlacement } from "@/types/crossword";

type Props = {
	clues: { across: WordPlacement[]; down: WordPlacement[] };
	selectedClueId: number | null;
	selectedDirection: Direction;
	onSelectClue: (clueId: number, direction: Direction) => void;
};

function ClueSection({
	title,
	clues,
	direction,
	selectedClueId,
	selectedDirection,
	onSelectClue,
}: {
	title: string;
	clues: WordPlacement[];
	direction: Direction;
	selectedClueId: number | null;
	selectedDirection: Direction;
	onSelectClue: (clueId: number, direction: Direction) => void;
}) {
	return (
		<div>
			<h3 className="font-bold text-sm uppercase tracking-wide mb-2">
				{title}
			</h3>
			<ol className="space-y-1">
				{clues.map((clue) => {
					const isSelected =
						clue.id === selectedClueId &&
						direction === selectedDirection;
					return (
						<li
							key={clue.id}
							className={`text-sm cursor-pointer rounded px-2 py-1 ${
								isSelected
									? "bg-blue-100 font-medium"
									: "hover:bg-muted"
							}`}
							onClick={() => onSelectClue(clue.id, direction)}
							onKeyDown={() => {}}
						>
							<span className="font-semibold mr-1">
								{clue.id}.
							</span>
							{clue.clue}
						</li>
					);
				})}
			</ol>
		</div>
	);
}

export function ClueList({
	clues,
	selectedClueId,
	selectedDirection,
	onSelectClue,
}: Props) {
	return (
		<div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
			<ClueSection
				title="Across"
				clues={clues.across}
				direction="across"
				selectedClueId={selectedClueId}
				selectedDirection={selectedDirection}
				onSelectClue={onSelectClue}
			/>
			<ClueSection
				title="Down"
				clues={clues.down}
				direction="down"
				selectedClueId={selectedClueId}
				selectedDirection={selectedDirection}
				onSelectClue={onSelectClue}
			/>
		</div>
	);
}
