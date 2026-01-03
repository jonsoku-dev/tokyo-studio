import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	ssr: {
		// Externalize server-only packages
		noExternal: ["@itcom/db"],
	},
	build: {
		// Ensure server modules are not bundled into client
		rollupOptions: {
			external: [/\.server\.(ts|tsx)$/],
		},
	},
});
