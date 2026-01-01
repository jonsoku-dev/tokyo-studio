import { db } from "@itcom/db/client";
import { sql } from "drizzle-orm";
import { loaderHandler, ServiceUnavailableError } from "~/shared/lib";

export const loader = loaderHandler(async () => {
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

		return { success: true, message: "Reputation setup completed" };
	} catch (error) {
		console.error("Setup failed:", error);
		throw new ServiceUnavailableError("Setup failed");
	}
});
