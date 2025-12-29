import { db } from "@itcom/db/client";
import type { InsertProfile } from "@itcom/db/schema";
import { profilePrivacySettings, profiles } from "@itcom/db/schema";
import { eq } from "drizzle-orm";

export const profileService = {
	async getPublicProfile(slug: string) {
		const profile = await db.query.profiles.findFirst({
			where: eq(profiles.slug, slug),
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						avatarUrl: true,
						email: true,
					},
					with: {
						profilePrivacySettings: true,
					},
				},
			},
		});

		if (!profile || !profile.user) return null;

		const { user } = profile;
		const privacy = user.profilePrivacySettings || {
			hideEmail: true,
			hideFullName: false,
			hideActivity: false,
		};

		// Filter data based on privacy settings
		return {
			...profile,
			user: {
				id: user.id,
				name: privacy.hideFullName ? profile.slug : user.name, // Use slug/username if name hidden
				avatarUrl: user.avatarUrl,
				email: privacy.hideEmail ? null : user.email,
			},
			// Start with basic privacy logic; strictly filtering activity/badges will come later
		};
	},

	async getProfileByUserId(userId: string) {
		return await db.query.profiles.findFirst({
			where: eq(profiles.userId, userId),
			with: {
				user: {
					with: {
						profilePrivacySettings: true,
					},
				},
			},
		});
	},

	async updateProfile(userId: string, data: Partial<InsertProfile>) {
		const existing = await this.getProfileByUserId(userId);
		if (!existing) {
			return await db
				.insert(profiles)
				.values({
					...data,
					userId,
					jobFamily: data.jobFamily || "frontend", // Default values strictly required by schema if missing
					level: data.level || "junior",
					jpLevel: data.jpLevel || "None",
					enLevel: data.enLevel || "Basic",
				} as InsertProfile)
				.returning();
		}
		return await db
			.update(profiles)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(profiles.userId, userId))
			.returning();
	},

	async updatePrivacySettings(
		userId: string,
		settings: {
			hideEmail?: boolean;
			hideFullName?: boolean;
			hideActivity?: boolean;
		},
	) {
		const existing = await db.query.profilePrivacySettings.findFirst({
			where: eq(profilePrivacySettings.userId, userId),
		});

		if (!existing) {
			return await db
				.insert(profilePrivacySettings)
				.values({ ...settings, userId })
				.returning();
		}

		return await db
			.update(profilePrivacySettings)
			.set({ ...settings, updatedAt: new Date() })
			.where(eq(profilePrivacySettings.userId, userId))
			.returning();
	},

	async isSlugAvailable(slug: string, currentUserId?: string) {
		const existing = await db.query.profiles.findFirst({
			where: eq(profiles.slug, slug),
		});

		if (!existing) return true;
		if (currentUserId && existing.userId === currentUserId) return true;

		return false;
	},
};
