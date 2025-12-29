/**
 * SPEC 001: Social Authentication with Token Storage
 *
 * Implements OAuth authentication for Google, GitHub, Kakao, Line
 * - Stores encrypted access/refresh tokens
 * - Links accounts by email
 * - Updates user profile from provider data
 */

import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { accountProviders, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { encryptToken } from "~/shared/utils/token-encryption.server";

// Re-export authenticator
export const authenticator = new Authenticator<string>();

/**
 * Helper function to store OAuth tokens
 */
async function storeOAuthTokens(
	userId: string,
	provider: string,
	providerAccountId: string,
	tokens: {
		accessToken: string;
		refreshToken?: string;
		expiresIn?: number;
	},
) {
	const expiresAt = tokens.expiresIn
		? new Date(Date.now() + tokens.expiresIn * 1000)
		: null;

	// Encrypt tokens before storage
	const encryptedAccessToken = encryptToken(tokens.accessToken);
	const encryptedRefreshToken = tokens.refreshToken
		? encryptToken(tokens.refreshToken)
		: null;

	// Check if account provider already exists
	const existing = await db.query.accountProviders.findFirst({
		where: eq(accountProviders.userId, userId),
	});

	if (existing) {
		// Update existing
		await db
			.update(accountProviders)
			.set({
				accessToken: encryptedAccessToken,
				refreshToken: encryptedRefreshToken,
				tokenExpiresAt: expiresAt,
				lastUsedAt: new Date(),
			})
			.where(eq(accountProviders.id, existing.id));
	} else {
		// Create new
		await db.insert(accountProviders).values({
			id: crypto.randomUUID(),
			userId,
			provider,
			providerAccountId,
			accessToken: encryptedAccessToken,
			refreshToken: encryptedRefreshToken,
			tokenExpiresAt: expiresAt,
			linkedAt: new Date(),
			lastUsedAt: new Date(),
		});
	}
}

// --- Google ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	authenticator.use(
		new OAuth2Strategy(
			{
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
				tokenEndpoint: "https://oauth2.googleapis.com/token",
				redirectURI: "/api/auth/google/callback",
				scopes: ["openid", "email", "profile"],
			},
			async ({ tokens }) => {
				const profileRes = await fetch(
					"https://www.googleapis.com/oauth2/v2/userinfo",
					{
						headers: { Authorization: `Bearer ${tokens.accessToken}` },
					},
				);
				const profile = await profileRes.json();

				const [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.googleId, profile.id));

				if (existingUser) {
					// Store/update tokens
					await storeOAuthTokens(existingUser.id, "google", profile.id, {
						accessToken: tokens.accessToken(),
						refreshToken: tokens.refreshToken?.() || undefined,
					});
					return existingUser.id;
				}

				const [userByEmail] = await db
					.select()
					.from(users)
					.where(eq(users.email, profile.email));

				if (userByEmail) {
					await db
						.update(users)
						.set({ googleId: profile.id })
						.where(eq(users.id, userByEmail.id));

					// Store tokens
					await storeOAuthTokens(userByEmail.id, "google", profile.id, {
						accessToken: tokens.accessToken(),
						refreshToken: tokens.refreshToken?.() || undefined,
					});

					return userByEmail.id;
				}

				const [newUser] = await db
					.insert(users)
					.values({
						email: profile.email,
						name: profile.name,
						password: "oauth-placeholder",
						googleId: profile.id,
						avatarUrl: profile.picture,
						emailVerified: new Date(), // Google emails are implicitly verified
					})
					.returning();

				// Store tokens
				await storeOAuthTokens(newUser.id, "google", profile.id, {
					accessToken: tokens.accessToken(),
					refreshToken: tokens.refreshToken?.() || undefined,
				});

				return newUser.id;
			},
		),
		"google",
	);
}

// --- GitHub ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
	authenticator.use(
		new OAuth2Strategy(
			{
				clientId: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
				authorizationEndpoint: "https://github.com/login/oauth/authorize",
				tokenEndpoint: "https://github.com/login/oauth/access_token",
				redirectURI: "/api/auth/github/callback",
				scopes: ["user:email"],
			},
			async ({ tokens }) => {
				const userRes = await fetch("https://api.github.com/user", {
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
						"User-Agent": "Japan-IT-Job-App",
					},
				});
				const user = await userRes.json();

				// Get email separately if private
				let email = user.email;
				if (!email) {
					const emailsRes = await fetch("https://api.github.com/user/emails", {
						headers: {
							Authorization: `Bearer ${tokens.accessToken}`,
							"User-Agent": "Japan-IT-Job-App",
						},
					});
					const emails = await emailsRes.json();
					email =
						emails.find((e: { primary: boolean; email: string }) => e.primary)
							?.email || emails[0]?.email;
				}

				const [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.githubId, String(user.id)));
				if (existingUser) return existingUser.id;

				if (email) {
					const [userByEmail] = await db
						.select()
						.from(users)
						.where(eq(users.email, email));
					if (userByEmail) {
						await db
							.update(users)
							.set({ githubId: String(user.id) })
							.where(eq(users.id, userByEmail.id));
						return userByEmail.id;
					}
				}

				const [newUser] = await db
					.insert(users)
					.values({
						email: email || `${user.id}@github.oauth`,
						name: user.name || user.login,
						password: "oauth-placeholder",
						githubId: String(user.id),
						avatarUrl: user.avatar_url,
						emailVerified: email ? new Date() : null, // GitHub primary emails are verified
					})
					.returning();
				return newUser.id;
			},
		),
		"github",
	);
}

// --- Kakao ---
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
	authenticator.use(
		new OAuth2Strategy(
			{
				clientId: process.env.KAKAO_CLIENT_ID,
				clientSecret: process.env.KAKAO_CLIENT_SECRET,
				authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
				tokenEndpoint: "https://kauth.kakao.com/oauth/token",
				redirectURI: "/api/auth/kakao/callback",
			},
			async ({ tokens }) => {
				const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
					headers: { Authorization: `Bearer ${tokens.accessToken}` },
				});
				const me = await meRes.json();
				const kakaoId = String(me.id);
				const email = me.kakao_account?.email;
				const name =
					me.properties?.nickname ||
					me.kakao_account?.profile?.nickname ||
					`Kakao User`;

				const [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.kakaoId, kakaoId));
				if (existingUser) return existingUser.id;

				if (email) {
					const [userByEmail] = await db
						.select()
						.from(users)
						.where(eq(users.email, email));
					if (userByEmail) {
						await db
							.update(users)
							.set({ kakaoId })
							.where(eq(users.id, userByEmail.id));
						return userByEmail.id;
					}
				}

				const [newUser] = await db
					.insert(users)
					.values({
						email: email || `${kakaoId}@kakao.oauth`,
						name: name,
						password: "oauth-placeholder",
						kakaoId: kakaoId,
						avatarUrl: me.properties?.profile_image,
						emailVerified: email ? new Date() : null, // Kakao emails are verified if provided
					})
					.returning();
				return newUser.id;
			},
		),
		"kakao",
	);
}

// --- Line ---
if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
	authenticator.use(
		new OAuth2Strategy(
			{
				clientId: process.env.LINE_CLIENT_ID,
				clientSecret: process.env.LINE_CLIENT_SECRET,
				authorizationEndpoint: "https://access.line.me/oauth2/v2.1/authorize",
				tokenEndpoint: "https://api.line.me/oauth2/v2.1/token",
				redirectURI: "/api/auth/line/callback",
				scopes: ["profile", "openid", "email"],
			},
			async ({ tokens }) => {
				const meRes = await fetch("https://api.line.me/v2/profile", {
					headers: { Authorization: `Bearer ${tokens.accessToken}` },
				});
				const me = await meRes.json();
				const lineId = me.userId;

				const [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.lineId, lineId));
				if (existingUser) return existingUser.id;

				const email = `${lineId}@line.oauth`;

				const [newUser] = await db
					.insert(users)
					.values({
						email,
						name: me.displayName,
						password: "oauth-placeholder",
						lineId: lineId,
						avatarUrl: me.pictureUrl,
						emailVerified: new Date(), // Line logins are verified
					})
					.returning();

				return newUser.id;
			},
		),
		"line",
	);
}
