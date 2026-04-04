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
    <>
      <Button variant="outline" onClick={onCheckWord} disabled={!hasSelection}>
        Check Word
      </Button>
      <Button variant="outline" onClick={onCheckPuzzle}>
        Check Puzzle
      </Button>
      <Button variant="outline" onClick={onRevealWord} disabled={!hasSelection}>
        Reveal Word
      </Button>
      <Button variant="secondary" onClick={onReset}>
        Reset
      </Button>
    </>
  );
}
