import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";

const { Pool } = pg;

// Ensure DATABASE_URL is set in .env
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
