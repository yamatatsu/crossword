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

1. **Start with theme words first** — pick 4-5 words that fit the theme (season, topic, etc.). These are your non-negotiables.
2. Pick 2 anchor words (6-7 letters) from your theme candidates, or add them now. Anchors should have common letters at varied positions.
3. **Pre-validate intersection compatibility** — for the Two-Anchor Scaffold Pattern, check that for each column c of anchor1, a real English word exists satisfying `word[0]=anchor1[c]` and `word[R]=anchor2[c]`. If 2+ columns have no valid down word, swap one anchor now. **Maximum 2 anchor-pair swaps before restarting with a new theme/word set.**
4. Pick remaining supporting words (3-6 letters) to fill intersection slots identified in step 3.
5. Avoid crosswordese (ERNE, ESNE, OLEO, EPEE, STOA, etc.) — see quality-guidelines.md for full blacklist
6. No duplicate words in the grid

### Step 3: Construct the Grid

Read `references/grid-construction.md` for the detailed construction method. Key principles:

1. **Use the Two-Anchor Scaffold Pattern** (see grid-construction.md Phase B) — place two anchor across words at row 0 and row R, then fill each column with a down word whose first letter matches anchor1 and whose letter at position R matches anchor2. This guarantees clean intersections by construction.
2. **Place remaining words in decreasing length order** — shorter words (3-4 letters) are most flexible, save them for last
3. At each placement, verify: (a) every intersection letter matches, (b) the grid remains fully connected (no isolated regions)
4. **Backtrack when stuck**: if a word cannot be placed cleanly, remove the most recently placed word and try a different position or substitute word. Never force an invalid intersection. **Backtracking is limited to 3 attempts per word — if exceeded, swap the word for a different one with more cooperative letters.**
5. After all 10 words are placed, calculate the bounding box for grid size

**Critical**: At every intersection cell, both the across and down word MUST have the identical letter. Verify this character-by-character. This is the #1 source of invalid puzzles.

**Output efficiency**: During grid construction, do NOT output intermediate grid states or step-by-step verification logs. Only output the **final placed grid** once all 10 words are successfully positioned.

### Step 4: Write Clues

Follow the clue-writing rules in `references/quality-guidelines.md`. Key requirements:

- **Use at least 4 different clue types** across the 10 clues (definition, fill-in-blank, wordplay, double definition, etc. — see the clue type table in quality-guidelines.md)
- **Grammatical matching is mandatory**: plural answer → plural clue, past tense answer → past tense clue, same part of speech
- Each clue must have exactly one unambiguous answer
- **Natick Principle**: if a proper noun appears in the grid, its crossing words must all be common — never cross two obscure proper nouns at the same square (see quality-guidelines.md)

### Step 5: Assign Clue Numbers

Scan cells left-to-right, top-to-bottom. A cell that starts any word (across or down) gets the next sequential number. Words sharing a start cell share the same number.

### Step 6: Write and Validate

1. Write the JSON to `public/puzzles/{date}.json`
2. Run: `bun run scripts/validate-puzzle.ts public/puzzles/{date}.json`
3. If validation fails, fix the specific intersection conflict reported and re-validate. **Maximum 2 fix attempts.** If validation still fails after 2 attempts, discard the current grid entirely and restart from Step 2 with a new word list.

### Step 7: Self-Review Checklist

Before committing, verify:
- [ ] 10 words, all UPPERCASE, all 3+ letters
- [ ] No more than 2 three-letter words
- [ ] No duplicate words in the grid
- [ ] No crosswordese (ERNE, ESNE, OLEO, EPEE, STOA, etc.)
- [ ] No two obscure proper nouns crossing at the same cell (Natick Principle)
- [ ] Clues use at least 4 different types (not all plain definitions)
- [ ] Every clue grammatically matches its answer (tense, number, part of speech)
- [ ] No clue repeats its answer word
- [ ] Grid has no isolated regions
- [ ] Validation script passes

## References

- **Word selection, clue writing, difficulty**: [references/quality-guidelines.md](references/quality-guidelines.md)
- **Grid construction method with example**: [references/grid-construction.md](references/grid-construction.md)
