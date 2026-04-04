import { useCallback, useEffect, useRef, useState } from "react";
import { buildCellNumbers, getCellsForWord } from "@/lib/crossword";
import type { CrosswordState } from "@/types/crossword";

type Props = {
  state: CrosswordState;
  onSelectCell: (row: number, col: number) => void;
  onSetCell: (row: number, col: number, letter: string) => void;
  onDeleteCell: () => void;
  onMove: (action: { type: "MOVE"; direction: "up" | "down" | "left" | "right" }) => void;
};

function getSelectedWordCells(state: CrosswordState): Set<string> {
  const cells = new Set<string>();
  if (state.selectedClueId === null) return cells;
  const word = state.puzzle.words.find(
    (w) => w.id === state.selectedClueId && w.direction === state.selectedDirection,
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

  const isSelected = state.selectedCell?.row === row && state.selectedCell?.col === col;
  if (isSelected) return "bg-blue-300";
  if (wordCells.has(`${row},${col}`)) return "bg-blue-100";

  return "bg-background";
}

export function CrosswordGrid({ state, onSelectCell, onSetCell, onDeleteCell, onMove }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellNumbers = buildCellNumbers(state.puzzle);
  const wordCells = getSelectedWordCells(state);
  const { rows, cols } = state.puzzle.size;

  // Dynamic cell size based on container width
  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const availableWidth = width - 4; // subtract border (2px each side)
      const size = Math.floor(availableWidth / cols);
      setCellSize(Math.min(48, Math.max(20, size)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cols]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        onSetCell(state.selectedCell.row, state.selectedCell.col, e.key);
      }
    },
    [state.selectedCell, onSetCell, onDeleteCell, onMove],
  );

  // Handle mobile virtual keyboard input
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const value = input.value;
      input.value = "";

      if (!state.selectedCell) return;
      const match = value.match(/[a-zA-Z]/);
      if (match) {
        onSetCell(state.selectedCell.row, state.selectedCell.col, match[0]);
      }
    },
    [state.selectedCell, onSetCell],
  );

  // Focus hidden input when cell is selected (fallback for programmatic selection)
  useEffect(() => {
    if (state.selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.selectedCell]);

  // Relative font sizes
  const fontSize = Math.max(10, cellSize * 0.45);
  const numberFontSize = Math.max(7, cellSize * 0.25);

  return (
    <div ref={wrapperRef} className="w-full" style={{ touchAction: "manipulation" }}>
      <div
        className="relative outline-none inline-block border-2 border-primary"
        data-testid="crossword-grid"
        style={{
          lineHeight: 0,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Hidden input for virtual keyboard */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Crossword input"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          style={{
            position: "absolute",
            opacity: 0,
            width: 1,
            height: 1,
            top: 0,
            left: 0,
            padding: 0,
            border: "none",
            fontSize: "16px",
          }}
        />
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
                    width: cellSize,
                    height: cellSize,
                  }}
                  onClick={() => {
                    if (cell) {
                      onSelectCell(row, col);
                      // Focus immediately in user gesture context for iOS keyboard
                      inputRef.current?.focus();
                    }
                  }}
                  onKeyDown={() => {}}
                >
                  {num && (
                    <span
                      className="absolute top-0 left-0.5 leading-tight text-muted-foreground"
                      style={{ fontSize: numberFontSize }}
                    >
                      {num}
                    </span>
                  )}
                  {cell && (
                    <span
                      data-testid="cell-letter"
                      className="flex items-center justify-center w-full h-full font-semibold"
                      style={{ fontSize }}
                    >
                      {cell.letter}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
