import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
	base: mode === "production" ? "/crossword/" : "/",
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Crossword",
				short_name: "Crossword",
				description: "Daily crossword puzzle",
				theme_color: "#863bff",
				background_color: "#ffffff",
				display: "standalone",
				icons: [
					{
						src: "favicon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any",
					},
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
}));
