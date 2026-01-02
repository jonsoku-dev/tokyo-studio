import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "../../.env" }); // Load from root .env

export default defineConfig({
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/itcom",
	},
});
