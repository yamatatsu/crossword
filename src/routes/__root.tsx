import { Outlet, createRootRoute } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
	component: function RootLayout() {
		return (
			<div className="min-h-screen bg-background">
				<header className="border-b px-4 py-3">
					<h1 className="text-xl font-bold">Daily Crossword</h1>
				</header>
				<main className="container mx-auto p-4">
					<Outlet />
				</main>
			</div>
		);
	},
});
