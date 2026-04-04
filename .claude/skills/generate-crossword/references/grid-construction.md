# Grid Construction Method

## Table of Contents
1. Overview
2. Step-by-Step Process
3. Intersection Verification
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

### Phase B: Build the Grid Incrementally
1. **Place the first anchor word** across at row 0. This is the spine.
2. **Place down words** that intersect the anchor. For each:
   - Find a letter in the anchor word that matches a letter in the down word
   - The down word's row starts at: `anchor_row - position_of_shared_letter_in_down_word`
   - Verify the column position and that no other cells conflict
3. **Place the second anchor word** across, intersecting one or more down words already placed. Verify every intersection.
4. **Continue adding words**, always verifying intersections before finalizing.
5. **Calculate grid size** from the bounding box of all placed words.

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

---

## 4. Example Walkthrough

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
