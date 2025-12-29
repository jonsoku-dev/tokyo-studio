import { sql } from "drizzle-orm";

import { db } from "@itcom/db/client";

export async function loader() {
	try {
		// Function to update user reputation when reputation_logo is inserted/deleted
		await db.execute(sql`
            CREATE OR REPLACE FUNCTION update_user_reputation()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    UPDATE users
                    SET reputation = reputation + NEW.amount
                    WHERE id = NEW.user_id;
                    RETURN NEW;
                ELSIF (TG_OP = 'DELETE') THEN
                    UPDATE users
                    SET reputation = reputation - OLD.amount
                    WHERE id = OLD.user_id;
                    RETURN OLD;
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);

		await db.execute(sql`
            DROP TRIGGER IF EXISTS reputation_log_insert_trigger ON reputation_logs;
            CREATE TRIGGER reputation_log_insert_trigger
            AFTER INSERT OR DELETE ON reputation_logs
            FOR EACH ROW
            EXECUTE FUNCTION update_user_reputation();
        `);

		return new Response(
			JSON.stringify({ success: true, message: "Reputation setup completed" }),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Setup failed:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
