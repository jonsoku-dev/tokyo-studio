import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	ssr: {
		// Bundle these packages instead of externalizing them
		// Required for Vercel Serverless to find all dependencies at runtime
		noExternal: [
			"@itcom/db"
		],
	},
});
