import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";
import { puzzleRoute } from "./routes/puzzle.$date";

const routeTree = rootRoute.addChildren([indexRoute, puzzleRoute]);

export const router = createRouter({
	routeTree,
	basepath: import.meta.env.BASE_URL,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
