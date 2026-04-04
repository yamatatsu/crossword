import { Outlet, createRootRoute } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return (
      <div className="min-h-dvh bg-background">
        <header className="border-b px-3 py-2">
          <h1 className="text-lg font-bold">Daily Crossword</h1>
        </header>
        <main className="px-2 py-3">
          <Outlet />
        </main>
      </div>
    );
  },
});
