import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: () => {
		const today = new Date().toISOString().split("T")[0];
		throw redirect({ to: "/puzzle/$date", params: { date: today } });
	},
});
