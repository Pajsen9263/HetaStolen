import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// Tell Vite to leave bun imports alone during the build
		external: ["bun:sqlite", "bun"]
	}
});
