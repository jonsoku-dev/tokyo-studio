import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { ForbiddenError } from "~/shared/lib";

/**
 * Checks if the user is authorized to perform an action on a resource owned by targetUserId.
 * Allows access if:
 * 1. User is an admin
 * 2. User is the owner (userId === targetUserId)
 *
 * @param userId - The ID of the authenticated user
 * @param targetUserId - The ID of the owner of the resource
 * @throws ForbiddenError if not authorized
 */
export async function requireOwnerOrAdmin(
	userId: string,
	targetUserId: string,
) {
	if (userId === targetUserId) return;

	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (user?.role === "admin") return;

	throw new ForbiddenError("You are not authorized to perform this action");
}
