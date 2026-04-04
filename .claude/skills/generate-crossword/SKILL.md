---
name: generate-crossword
description: Generate a high-quality English crossword puzzle and save it as a validated JSON file. Use when asked to create a crossword puzzle, generate a daily puzzle, or when the GitHub Actions workflow needs to produce a new puzzle for public/puzzles/. Triggers on requests mentioning "crossword", "puzzle", "generate puzzle", "daily puzzle", or "new puzzle".
---

# Generate Crossword Puzzle

Generate an English crossword puzzle with 10 words, writing a validated JSON file to `public/puzzles/{YYYY-MM-DD}.json`.

**Important**: Dates must always be in JST (Japan Standard Time, UTC+9). When calculating "today" or "tomorrow", use JST regardless of the system timezone.

## Workflow

### Step 1: Read Quality Guidelines

Read `references/quality-guidelines.md` for word selection, clue writing, and grid design principles. Key takeaways to keep in mind:

- **Words**: Common English, diverse categories, varied lengths (3-7+ letters), rich in high-frequency letters (E, A, R, S, T, N). Avoid obscure terms, abbreviations, max 2 three-letter words.
- **Clues**: Concise (<80 chars), one fair path to the answer, mix of clue types (definition, fill-in-blank, double meaning, associative). Never repeat the answer word in the clue.
- **Grid**: Minimize black cells (<35%), maximize intersections, ensure connectivity. Prefer at least 2 anchor words (6+ letters).

### Step 2: Select 10 Words

1. Pick 2-3 anchor words (6-7 letters) with common letters at various positions
2. Pick 7-8 supporting words (3-6 letters) that share letters with anchors
3. Verify the word list has enough shared letters for dense intersections
4. Optionally apply a light theme (seasonal, topical) to 3-4 of the words

### Step 3: Construct the Grid

Read `references/grid-construction.md` for the detailed construction method. Follow the incremental build process:

1. Place the first anchor word across at row 0
2. Place down words intersecting it, verifying each intersection letter
3. Place the second anchor word across, intersecting existing down words
4. Continue adding words, **always verifying every intersection before proceeding**
5. After all words are placed, calculate the bounding box for grid size

**Critical**: At every intersection cell, both the across and down word MUST have the identical letter. Verify this character-by-character. This is the #1 source of invalid puzzles.

### Step 4: Write Clues

For each word, write a clue following these principles:
- Mix clue types across the puzzle (don't use only definitions)
- At least 2 clues should use wordplay, double meaning, or fill-in-blank
- Each clue must have exactly one unambiguous answer
- Match grammatical form (plural clue → plural answer)

### Step 5: Assign Clue Numbers

Scan cells left-to-right, top-to-bottom. A cell that starts any word (across or down) gets the next sequential number. Words sharing a start cell share the same number.

### Step 6: Write and Validate

1. Write the JSON to `public/puzzles/{date}.json`
2. Run: `bun run scripts/validate-puzzle.ts public/puzzles/{date}.json`
3. If validation fails, fix intersection conflicts and re-validate
4. Repeat until validation passes

### Step 7: Self-Review Checklist

Before committing, verify:
- [ ] 10 words, all UPPERCASE, all 3+ letters
- [ ] No more than 2 three-letter words
- [ ] Clues are varied in type (not all plain definitions)
- [ ] No clue repeats its answer word
- [ ] Grid has no isolated regions
- [ ] Validation script passes

## References

- **Word selection, clue writing, difficulty**: [references/quality-guidelines.md](references/quality-guidelines.md)
- **Grid construction method with example**: [references/grid-construction.md](references/grid-construction.md)
