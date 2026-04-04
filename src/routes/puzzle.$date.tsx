import { createRoute, useLoaderData } from "@tanstack/react-router";
import { CrosswordPage } from "@/components/CrosswordPage";
import type { PuzzleData } from "@/types/crossword";
import { rootRoute } from "./__root";

function PuzzleRoute() {
	const puzzle = useLoaderData({ from: "/puzzle/$date" });
	return <CrosswordPage puzzle={puzzle} />;
}

export const puzzleRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/puzzle/$date",
	component: PuzzleRoute,
	loader: async ({ params }): Promise<PuzzleData> => {
		const res = await fetch(`${import.meta.env.BASE_URL}puzzles/${params.date}.json`);
		if (!res.ok) throw new Error("Puzzle not found");
		return res.json();
	},
	pendingComponent: () => (
		<div className="flex items-center justify-center py-20">
			<p className="text-muted-foreground">Loading puzzle...</p>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="flex items-center justify-center py-20">
			<p className="text-destructive">
				{error.message === "Puzzle not found"
					? "No puzzle available for this date."
					: "Failed to load puzzle."}
			</p>
		</div>
	),
});
