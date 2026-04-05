# Grid Construction Method

## Table of Contents
1. Overview
2. Step-by-Step Process (includes Backtracking)
3. Intersection Verification (includes Additional Placement Constraints)
4. Example Walkthrough
5. JSON Format

---

## 1. Overview

Building a valid crossword grid is the hardest part. The key constraint: **at every cell where an across word and a down word overlap, both words must have the same letter at that position.** This means words cannot be placed independently — each new word must be verified against all existing placements.

---

## 2. Step-by-Step Process

### Phase A: Choose a Word List
1. Select 10 candidate words (see quality-guidelines.md for selection criteria)
2. Include 2-3 "anchor" words (6-7 letters) and fill with 4-5 letter words
3. Ensure the word list has enough shared letters to allow intersections
4. No duplicate words allowed in the grid

### Phase A-2: Pre-validate Intersection Compatibility (do this BEFORE building)

Before touching the grid, verify that your word list can actually connect. For each pair of words you intend to cross, check that a shared letter exists at compatible positions.

**Scaffold compatibility check** (for the Two-Anchor pattern in Phase B):
Given anchor1 (across, row 0) and anchor2 (across, row R), for each column c you plan to fill with a down word, verify:
- `anchor1[c]` and `anchor2[c]` are known
- At least one real English word exists that has `anchor1[c]` at position 0 and `anchor2[c]` at position R

If you cannot find valid down words for 2+ columns, **swap one anchor word now** — do not proceed to Phase B with an unworkable word list. Maximum 2 anchor-pair swaps; if still stuck after that, restart Phase A entirely with a new theme or word set.

### Phase B: Build the Grid — Two-Anchor Scaffold Pattern (recommended)

This pattern eliminates most intersection failures by design:

**1. Place Anchor1 across at row 0.**

**2. Place Anchor2 across at row R (typically 3–5 rows below).**
   - Choose R so that 5-letter down words can bridge the two rows (R = 4 gives 5-letter down words; R = 5 gives 6-letter down words).

**3. For each column c in Anchor1, find a down word where:**
   - `down_word[0] = Anchor1[c]`  (top letter matches Anchor1)
   - `down_word[R] = Anchor2[c]`  (bottom letter matches Anchor2)
   - Place it down at (0, c). Both intersections are guaranteed correct by construction.

**4. Fill remaining words** (smaller across/down words) below or around the scaffold, verifying each intersection as in Section 3.

**5. Calculate grid size** from the bounding box of all placed words.

> **Why this works**: By choosing down words whose first and last letters are constrained to match the two anchors, you eliminate the most common failure mode (intersection mismatch). The internal letters of the down words are free, so finding valid English words is easy.

### Phase B-2: Backtracking

If a word cannot be placed without conflicts:
1. Try a different position or orientation for that word (**maximum 3 attempts**).
2. If no valid position exists after 3 attempts, **swap the word** for a different one with more cooperative letters — do not continue trying the same word.
3. If an entire section resists clean fill, consider rebuilding from Phase A with a new word list.
4. Never force an invalid intersection — it will fail validation.

**Do not output intermediate states** during backtracking. Only output the final grid once all words are placed successfully.

### Phase C: Assign Clue Numbers
- Scan cells left-to-right, top-to-bottom
- A cell gets a number if it's the start of an across word OR the start of a down word
- Numbers are sequential: 1, 2, 3, ...
- Multiple words starting at the same cell share the same number

---

## 3. Intersection Verification

For EVERY word placement, run this check mentally:

```
For each letter position (i) in the new word:
  Calculate the cell (row, col) this letter occupies
  If another word already occupies this cell:
    The existing letter at (row, col) MUST equal new_word[i]
    If not → CONFLICT → choose a different word or position
```

**Common mistake**: Forgetting that a down word placed at column X will occupy cells in rows Y through Y+len-1. If another across word crosses any of those rows at column X, the letters must match.

### Additional Placement Constraints
- **No duplicate words**: The same word must not appear twice in the grid.
- **Adjacency check**: Two parallel words in adjacent rows/columns must not create unintended mini-words in the perpendicular direction unless those are valid entries.
- **Minimize unchecked cells**: Every white cell should ideally belong to both an across and a down word. Cells in only one word give the solver no cross-checking help — minimize these.
- **Adjacent white cells in the same row**: The validator does not reject adjacent white cells that belong to different across words (or to no across word). However, this is bad for solver UX — a solver cannot tell where one word ends and the next begins. Avoid placing words such that a down-only cell is horizontally adjacent to the end of an across word with no black cell separating them.

---

## 4. Example Walkthrough

> **Note**: This example shows a simple linear build for clarity. In practice, you will often need to try multiple arrangements and backtrack when intersections don't work out. The example word list was chosen to work on the first try — real word lists usually require iteration.

Goal: Build a grid with STORM, TIGER, SCRUB, BRIGHT, OKAPI.

**Step 1**: Place STORM across at (0, 0):
```
Row 0: S T O R M
```

**Step 2**: Place SCRUB down at (0, 0) — shares 'S' at position 0:
```
Row 0: S T O R M
Row 1: C
Row 2: R
Row 3: U
Row 4: B
```

**Step 3**: Place TIGER down at (0, 1) — shares 'T' at position 0:
```
Row 0: S T O R M
Row 1: C I
Row 2: R G
Row 3: U E
Row 4: B R
```

**Step 4**: Place BRIGHT across at (4, 0) — verify intersections:
- (4, 0) = B → SCRUB[4] = B ✓
- (4, 1) = R → TIGER[4] = R ✓
- (4, 2) = I → no conflict ✓
- (4, 3) = G → no conflict ✓
- (4, 4) = H → no conflict ✓
- (4, 5) = T → no conflict ✓

```
Row 0: S T O R M . .
Row 1: C I . . . . .
Row 2: R G . . . . .
Row 3: U E . . . . .
Row 4: B R I G H T .
```

**Step 5**: Place OKAPI down at (0, 2) — shares 'O' with STORM at (0, 2):
- (0, 2) = O → STORM[2] = O ✓
- (1, 2) = K → no conflict ✓
- (2, 2) = A → no conflict ✓
- (3, 2) = P → no conflict ✓
- (4, 2) = I → BRIGHT[2] = I ✓  ← Also intersects BRIGHT!

All checks pass.

---

## 5. JSON Format

```json
{
  "date": "YYYY-MM-DD",
  "size": { "rows": <max_row + 1>, "cols": <max_col + 1> },
  "words": [
    {
      "id": <clue_number>,
      "word": "<UPPERCASE>",
      "clue": "<clue text>",
      "row": <start_row_0indexed>,
      "col": <start_col_0indexed>,
      "direction": "across" | "down"
    }
  ]
}
```

- `size` is the bounding box: find the maximum row and column occupied by any letter, add 1
- `id` is the clue number (not necessarily sequential with array index — two words at the same starting cell share the same id)
- `row` and `col` are 0-indexed
- All words UPPERCASE
