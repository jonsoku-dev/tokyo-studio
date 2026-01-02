import { db } from "@itcom/db/client";
import { communityCategories } from "@itcom/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getAdminCategories() {
	return db
		.select()
		.from(communityCategories)
		.orderBy(asc(communityCategories.orderIndex));
}

export async function createCategory(data: {
	name: string;
	slug: string;
	icon: string;
	orderIndex: number;
}) {
	return db.insert(communityCategories).values(data).returning();
}

export async function updateCategory(
	id: string,
	data: {
		name?: string;
		slug?: string;
		icon?: string;
		orderIndex?: number;
	},
) {
	return db
		.update(communityCategories)
		.set(data)
		.where(eq(communityCategories.id, id))
		.returning();
}

export async function deleteCategory(id: string) {
	return db.delete(communityCategories).where(eq(communityCategories.id, id));
}
