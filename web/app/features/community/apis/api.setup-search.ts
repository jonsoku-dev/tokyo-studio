import { db } from "@itcom/db/client";
import { sql } from "drizzle-orm";
import { data } from "react-router";

export async function loader() {
	try {
		// 1. Add column if not exists (Drizzle might do this via db:push, but being safe)
		// actually db:push handles the column creation if I run it, but let's assume we run this getting robust setup.
		// We'll rely on db:push for the column, but here we do the index and trigger.

		// 2. Create GIN Index
		await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_community_posts_search 
      ON community_posts USING GIN (search_vector);
    `);

		// 3. Create Trigger Function
		await db.execute(sql`
      CREATE OR REPLACE FUNCTION tsvector_update_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('pg_catalog.english', coalesce(NEW.title,'')), 'A') ||
          setweight(to_tsvector('pg_catalog.english', coalesce(NEW.content,'')), 'B');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `);

		// 4. Create Trigger
		await db.execute(sql`
      DROP TRIGGER IF EXISTS tsvector_update ON community_posts;
      CREATE TRIGGER tsvector_update
      BEFORE INSERT OR UPDATE ON community_posts
      FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger();
    `);

		// 5. Backfill existing posts
		await db.execute(sql`
			UPDATE community_posts 
			SET search_vector = 
				setweight(to_tsvector('pg_catalog.english', coalesce(title,'')), 'A') ||
				setweight(to_tsvector('pg_catalog.english', coalesce(content,'')), 'B');
		`);

		return data({
			success: true,
			message: "Search index and triggers set up successfully",
		});
	} catch (error: unknown) {
		console.error("Search setup failed:", error);
		return data(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
