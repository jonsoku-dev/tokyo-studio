import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	ssr: {
		// Bundle ALL dependencies into the server build for Vercel serverless
		// This is required because Vercel doesn't have access to node_modules at runtime
		noExternal: true,
	},
});
