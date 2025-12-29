import { db } from "@itcom/db/client";
import { sql } from "drizzle-orm";
import { data } from "react-router";

export async function loader() {
	try {
		// 1. Create or replace triggers for Post Score
		await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_post_score()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          IF (NEW.vote_type = 1) THEN
            UPDATE community_posts SET upvotes = upvotes + 1, score = score + 1 WHERE id = NEW.post_id;
          ELSE
            UPDATE community_posts SET downvotes = downvotes + 1, score = score - 1 WHERE id = NEW.post_id;
          END IF;
        ELSIF (TG_OP = 'DELETE') THEN
          IF (OLD.vote_type = 1) THEN
            UPDATE community_posts SET upvotes = upvotes - 1, score = score - 1 WHERE id = OLD.post_id;
          ELSE
            UPDATE community_posts SET downvotes = downvotes - 1, score = score + 1 WHERE id = OLD.post_id;
          END IF;
        ELSIF (TG_OP = 'UPDATE') THEN
          -- Revert old vote
          IF (OLD.vote_type = 1) THEN
            UPDATE community_posts SET upvotes = upvotes - 1, score = score - 1 WHERE id = OLD.post_id;
          ELSE
            UPDATE community_posts SET downvotes = downvotes - 1, score = score + 1 WHERE id = OLD.post_id;
          END IF;
          -- Apply new vote
          IF (NEW.vote_type = 1) THEN
            UPDATE community_posts SET upvotes = upvotes + 1, score = score + 1 WHERE id = NEW.post_id;
          ELSE
            UPDATE community_posts SET downvotes = downvotes + 1, score = score - 1 WHERE id = NEW.post_id;
          END IF;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

		await db.execute(sql`
      DROP TRIGGER IF EXISTS trigger_update_post_score ON post_votes;
      CREATE TRIGGER trigger_update_post_score
      AFTER INSERT OR UPDATE OR DELETE ON post_votes
      FOR EACH ROW EXECUTE FUNCTION update_post_score();
    `);

		// 2. Create or replace triggers for Comment Score
		await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_comment_score()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          IF (NEW.vote_type = 1) THEN
            UPDATE community_comments SET upvotes = upvotes + 1, score = score + 1 WHERE id = NEW.comment_id;
          ELSE
            UPDATE community_comments SET downvotes = downvotes + 1, score = score - 1 WHERE id = NEW.comment_id;
          END IF;
        ELSIF (TG_OP = 'DELETE') THEN
          IF (OLD.vote_type = 1) THEN
            UPDATE community_comments SET upvotes = upvotes - 1, score = score - 1 WHERE id = OLD.comment_id;
          ELSE
            UPDATE community_comments SET downvotes = downvotes - 1, score = score + 1 WHERE id = OLD.comment_id;
          END IF;
        ELSIF (TG_OP = 'UPDATE') THEN
           -- Revert old vote
          IF (OLD.vote_type = 1) THEN
            UPDATE community_comments SET upvotes = upvotes - 1, score = score - 1 WHERE id = OLD.comment_id;
          ELSE
            UPDATE community_comments SET downvotes = downvotes - 1, score = score + 1 WHERE id = OLD.comment_id;
          END IF;
          -- Apply new vote
          IF (NEW.vote_type = 1) THEN
            UPDATE community_comments SET upvotes = upvotes + 1, score = score + 1 WHERE id = NEW.comment_id;
          ELSE
            UPDATE community_comments SET downvotes = downvotes + 1, score = score - 1 WHERE id = NEW.comment_id;
          END IF;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

		await db.execute(sql`
      DROP TRIGGER IF EXISTS trigger_update_comment_score ON comment_votes;
      CREATE TRIGGER trigger_update_comment_score
      AFTER INSERT OR UPDATE OR DELETE ON comment_votes
      FOR EACH ROW EXECUTE FUNCTION update_comment_score();
    `);

		return data({
			success: true,
			message: "Voting system triggers set up successfully",
		});
	} catch (error: unknown) {
		console.error("Voting setup failed:", error);
		return data(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
