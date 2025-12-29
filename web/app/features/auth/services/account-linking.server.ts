/**
 * SPEC 001: Social Account Linking Service
 *
 * Allows users to link multiple social accounts to their profile
 * - Link Google, GitHub, Kakao, Line accounts
 * - Prevent duplicate linking
 * - Track linked providers
 * - Log linking/unlinking events
 */

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	accountProviders,
	authenticationLogs,
	users,
} from "@itcom/db/schema";

export type SocialProvider = "google" | "github" | "kakao" | "line";

export interface LinkProviderParams {
	userId: string;
	provider: SocialProvider;
	providerAccountId: string;
	accessToken?: string;
	refreshToken?: string;
	tokenExpiresAt?: Date;
	profileData?: {
		email?: string;
		name?: string;
		avatarUrl?: string;
	};
	ipAddress?: string;
	userAgent?: string;
}

/**
 * Link a social provider to user account
 */
export async function linkSocialProvider(
	params: LinkProviderParams,
): Promise<{ success: boolean; error?: string }> {
	const {
		userId,
		provider,
		providerAccountId,
		accessToken,
		refreshToken,
		tokenExpiresAt,
		profileData,
		ipAddress,
		userAgent,
	} = params;

	// Check if provider is already linked to this user
	const existingLink = await db.query.accountProviders.findFirst({
		where: and(
			eq(accountProviders.userId, userId),
			eq(accountProviders.provider, provider),
		),
	});

	if (existingLink) {
		return {
			success: false,
			error: `${provider} account is already linked to your profile`,
		};
	}

	// Check if this provider account is linked to another user
	const providerLinkedToOther = await db.query.accountProviders.findFirst({
		where: and(
			eq(accountProviders.provider, provider),
			eq(accountProviders.providerAccountId, providerAccountId),
		),
	});

	if (providerLinkedToOther && providerLinkedToOther.userId !== userId) {
		return {
			success: false,
			error: `This ${provider} account is already linked to another user`,
		};
	}

	// Link the account
	await db.insert(accountProviders).values({
		id: crypto.randomUUID(),
		userId,
		provider,
		providerAccountId,
		accessToken: accessToken || null,
		refreshToken: refreshToken || null,
		tokenExpiresAt: tokenExpiresAt || null,
		linkedAt: new Date(),
		lastUsedAt: new Date(),
	});

	// Update user's provider ID field (for backward compatibility)
	const providerIdField = `${provider}Id` as keyof typeof users.$inferInsert;
	await db
		.update(users)
		.set({ [providerIdField]: providerAccountId })
		.where(eq(users.id, userId));

	// Update profile data if provided
	if (profileData) {
		const updateData: Partial<typeof users.$inferInsert> = {};

		if (profileData.avatarUrl && !profileData.avatarUrl.includes("@")) {
			updateData.avatarUrl = profileData.avatarUrl;
		}

		if (Object.keys(updateData).length > 0) {
			await db.update(users).set(updateData).where(eq(users.id, userId));
		}
	}

	// Log the event
	await db.insert(authenticationLogs).values({
		id: crypto.randomUUID(),
		userId,
		eventType: "account_linked",
		provider,
		ipAddress: ipAddress || null,
		userAgent: userAgent || null,
		metadata: {
			providerAccountId,
		},
		timestamp: new Date(),
	});

	return { success: true };
}

/**
 * Unlink a social provider from user account
 */
export async function unlinkSocialProvider(
	userId: string,
	provider: SocialProvider,
	metadata?: {
		ipAddress?: string;
		userAgent?: string;
	},
): Promise<{ success: boolean; error?: string }> {
	// Check if provider is linked
	const link = await db.query.accountProviders.findFirst({
		where: and(
			eq(accountProviders.userId, userId),
			eq(accountProviders.provider, provider),
		),
	});

	if (!link) {
		return {
			success: false,
			error: `${provider} account is not linked`,
		};
	}

	// Check if user has other authentication methods
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!user) {
		return { success: false, error: "User not found" };
	}

	// Count linked providers
	const linkedProviders = await db.query.accountProviders.findMany({
		where: eq(accountProviders.userId, userId),
	});

	// Check if user has password set
	const hasPassword = user.password && user.password !== "oauth-placeholder";

	// User must have at least one authentication method
	if (linkedProviders.length === 1 && !hasPassword) {
		return {
			success: false,
			error:
				"Cannot unlink last authentication method. Please set a password first or link another account.",
		};
	}

	// Unlink the account
	await db
		.delete(accountProviders)
		.where(
			and(
				eq(accountProviders.userId, userId),
				eq(accountProviders.provider, provider),
			),
		);

	// Remove provider ID from user record
	const providerIdField = `${provider}Id` as keyof typeof users.$inferInsert;
	await db
		.update(users)
		.set({ [providerIdField]: null })
		.where(eq(users.id, userId));

	// Log the event
	await db.insert(authenticationLogs).values({
		id: crypto.randomUUID(),
		userId,
		eventType: "account_unlinked",
		provider,
		ipAddress: metadata?.ipAddress || null,
		userAgent: metadata?.userAgent || null,
		timestamp: new Date(),
	});

	return { success: true };
}

/**
 * Get all linked providers for a user
 */
export async function getLinkedProviders(userId: string) {
	const links = await db.query.accountProviders.findMany({
		where: eq(accountProviders.userId, userId),
	});

	return links.map((link) => ({
		provider: link.provider,
		linkedAt: link.linkedAt,
		lastUsedAt: link.lastUsedAt,
	}));
}

/**
 * Check if a provider is linked to a user
 */
export async function isProviderLinked(
	userId: string,
	provider: SocialProvider,
): Promise<boolean> {
	const link = await db.query.accountProviders.findFirst({
		where: and(
			eq(accountProviders.userId, userId),
			eq(accountProviders.provider, provider),
		),
	});

	return !!link;
}
