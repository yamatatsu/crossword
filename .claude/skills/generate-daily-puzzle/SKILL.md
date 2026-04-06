---
name: generate-daily-puzzle
description: Generate tomorrow's crossword puzzle locally and commit it. Use when running the daily puzzle generation workflow from a local environment instead of GitHub Actions. Equivalent to the generate-puzzle.yml CI workflow. Triggers on "/generate-daily-puzzle".
---

# Generate Daily Puzzle

GitHub Actions ワークフロー (`generate-puzzle.yml`) と同等の処理をローカルで実行する。

## Workflow

1. **Calculate puzzle date** — Run `TZ=Asia/Tokyo date -v+1d +%Y-%m-%d` (macOS) to get tomorrow's date in JST. Store as `$PUZZLE_DATE`.

2. **Generate puzzle** — Invoke the `/generate-crossword` skill with the date:
   ```
   /generate-crossword $PUZZLE_DATE
   ```
   Follow the skill's full 7-step workflow. Output: `public/puzzles/$PUZZLE_DATE.json`

3. **Validate** — Run `bun run scripts/validate-puzzle.ts public/puzzles/$PUZZLE_DATE.json` and confirm it passes.

4. **Commit** — Stage and commit:
   ```
   git add public/puzzles/$PUZZLE_DATE.json
   git commit -m "puzzle: add $PUZZLE_DATE daily puzzle"
   ```
   Do NOT push unless the user explicitly asks.
