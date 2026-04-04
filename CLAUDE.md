# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `bun run dev` — 開発サーバー起動 (http://localhost:5173)
- `bun run build` — TypeScriptチェック + プロダクションビルド
- `bun run lint` — oxlintでlint
- `bun run fmt` — oxfmtでフォーマット (src配下)
- `bun run fmt:check` — フォーマットチェック
- `bun run test` — playwright-bdd E2Eテスト実行 (bddgen → playwright test)
- `bun run test:ui` — Playwright UIモードでテスト実行
- `bun run test:unit` — vitestユニットテスト実行
- `bun run test:unit:watch` — vitestウォッチモード
- 単一テスト実行: `bddgen && bunx playwright test e2e/features/hello.feature`
- パズルバリデーション: `bun run scripts/validate-puzzle.ts public/puzzles/{date}.json`

## Architecture

Vite + React 19 SPA (TypeScript, ESM)。UIコンポーネントはshadcn/ui (Tailwind CSS v4)。
ルーティングはTanStack Router（コードベース）。

- `src/` — アプリケーションコード。`@/` エイリアスで参照可能
- `src/components/ui/` — shadcn/uiコンポーネント (`bunx shadcn@latest add <component>` で追加)
- `src/components/` — アプリケーションコンポーネント (CrosswordGrid, ClueList, etc.)
- `src/routes/` — TanStack Routerルート定義（コードベース、ファイルベースではない）
- `src/reducers/` — useReducer用の純粋なreducer関数
- `src/hooks/` — カスタムフック
- `src/types/` — TypeScript型定義
- `src/lib/utils.ts` — `cn()` ユーティリティ (clsx + tailwind-merge)
- `src/lib/crossword.ts` — クロスワードユーティリティ関数
- `public/puzzles/` — パズルJSONファイル (`{YYYY-MM-DD}.json`)
- `scripts/` — ビルド/生成スクリプト
- `e2e/features/` — Gherkinフィーチャーファイル
- `e2e/steps/` — playwright-bddステップ定義

## Testing (playwright-bdd)

playwright-bdd v8を使用。ステップ定義では`createBdd()`から`Given`/`When`/`Then`を取得する:

```ts
import { createBdd } from "playwright-bdd";
const { Given, When, Then } = createBdd();
```

テスト実行時、Vite devサーバーが自動起動される（CI以外では既存サーバーを再利用）。

## Crossword Puzzle ルール

- パズルJSONは `public/puzzles/{YYYY-MM-DD}.json` に格納。PuzzleData型に準拠
- グリッドはword placementsから実行時に計算（JSONには格納しない）
- 全ての単語交差点で同じ文字を共有すること（バリデーションスクリプトで検証）
- 単語はデータ上もUI上もすべて大文字
- `src/reducers/crosswordReducer.ts` は純粋関数。全状態遷移はこのreducerを通す
- `useCrossword` hookがコンポーネントとパズル状態の唯一のインターフェース
- セル座標は0-indexed (row, col)
- Directionは常に `"across"` または `"down"`

## Unit Testing (vitest)

- `bun run test:unit` — vitestユニットテスト実行
- テストファイルは `src/**/__tests__/*.test.ts` に配置
- Reducerテストは純粋関数テスト（React不要）
- Hookテストは `@testing-library/react` の `renderHook` を使用

## Routing (TanStack Router)

- コードベースルーティング（ファイルベースではない）
- `/` → `/puzzle/{today}` にリダイレクト
- `/puzzle/$date` → パズルJSON (`public/puzzles/{date}.json`) をloaderで取得して表示

## Daily Puzzle Generation (GitHub Actions)

- `.github/workflows/generate-puzzle.yml` で毎日JST 0時（UTC 15時）に実行
- Claude Code Actionでパズルを生成し、`scripts/validate-puzzle.ts` で検証後コミット
- `ANTHROPIC_API_KEY` シークレットが必要

## Lint / Format

- Linter: oxlint（eslintではない）
- Formatter: oxfmt（prettierではない）
- pre-commitフック (husky): oxlintが自動実行される
