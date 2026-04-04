import { useState } from "react";
import { useCrossword } from "@/hooks/useCrossword";
import type { PuzzleData } from "@/types/crossword";
import { ClueList } from "./ClueList";
import { CrosswordGrid } from "./CrosswordGrid";
import { CrosswordToolbar } from "./CrosswordToolbar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedWord =
    state.selectedClueId !== null
      ? state.puzzle.words.find(
          (w) => w.id === state.selectedClueId && w.direction === state.selectedDirection,
        )
      : null;

  return (
    <div className="flex flex-col gap-3">
      {state.completed && (
        <div className="rounded-lg bg-green-100 px-4 py-3 text-green-800 font-semibold">
          Congratulations! You completed the puzzle!
        </div>
      )}

      {/* Active clue display */}
      <div className="min-h-[2.5rem] flex items-center">
        {selectedWord ? (
          <div className="text-sm font-medium py-2 px-3 bg-blue-50 rounded-md border border-blue-200 w-full">
            <span className="font-bold">
              {selectedWord.id}
              {selectedWord.direction === "across" ? "A" : "D"}.
            </span>{" "}
            {selectedWord.clue}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2 px-3">Tap a cell to start</div>
        )}
      </div>

      <CrosswordGrid
        state={state}
        onSelectCell={selectCell}
        onSetCell={setCell}
        onDeleteCell={deleteCell}
        onMove={move}
      />

      <div className="flex flex-wrap gap-2">
        <CrosswordToolbar
          onCheckWord={checkWord}
          onCheckPuzzle={checkPuzzle}
          onRevealWord={revealWord}
          onReset={reset}
          hasSelection={state.selectedClueId !== null}
        />
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" />}>Clues</SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70dvh]">
            <SheetHeader>
              <SheetTitle>Clues</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <ClueList
                clues={clues}
                selectedClueId={state.selectedClueId}
                selectedDirection={state.selectedDirection}
                onSelectClue={(id, dir) => {
                  selectClue(id, dir);
                  setSheetOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
