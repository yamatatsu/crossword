import { Button } from "@/components/ui/button";

type Props = {
	onCheckWord: () => void;
	onCheckPuzzle: () => void;
	onRevealWord: () => void;
	onReset: () => void;
	hasSelection: boolean;
};

export function CrosswordToolbar({
	onCheckWord,
	onCheckPuzzle,
	onRevealWord,
	onReset,
	hasSelection,
}: Props) {
	return (
		<div className="flex flex-wrap gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={onCheckWord}
				disabled={!hasSelection}
			>
				Check Word
			</Button>
			<Button variant="outline" size="sm" onClick={onCheckPuzzle}>
				Check Puzzle
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={onRevealWord}
				disabled={!hasSelection}
			>
				Reveal Word
			</Button>
			<Button variant="secondary" size="sm" onClick={onReset}>
				Reset
			</Button>
		</div>
	);
}
