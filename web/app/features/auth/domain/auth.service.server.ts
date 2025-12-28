import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
	createVerificationToken,
	sendVerificationEmail,
} from "~/features/auth/services/email-verification.server";
import { db } from "~/shared/db/client.server";
import { users } from "~/shared/db/schema";
import type { AuthResponse, LoginDTO, SignupDTO, User } from "./auth.types";

export const authService = {
	login: async (credentials: LoginDTO): Promise<AuthResponse> => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, credentials.email))
			.limit(1);

		if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
			throw new Error("Invalid credentials");
		}

		// Mock token for now
		const token = `mock_jwt_token_${user.id}`;

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role as "user" | "admin",
				avatarUrl: user.avatarUrl || null,
			},
			token,
		};
	},

	signup: async (data: SignupDTO): Promise<AuthResponse> => {
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, data.email))
			.limit(1);

		if (existingUser) {
			throw new Error("User already exists");
		}

		const hashedPassword = await bcrypt.hash(data.password, 10);

		const [newUser] = await db
			.insert(users)
			.values({
				email: data.email,
				password: hashedPassword,
				name: data.name,
				avatarUrl: `https://avatar.vercel.sh/${data.email}`,
			})
			.returning();

		// Trigger email verification
		const verificationToken = await createVerificationToken(newUser.id);
		await sendVerificationEmail(newUser.email, verificationToken);

		const token = `mock_jwt_token_${newUser.id}`;

		return {
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role as "user" | "admin",
				avatarUrl: newUser.avatarUrl || null,
			},
			token,
		};
	},

	me: async (_token: string): Promise<User> => {
		return {
			id: "u_temp",
			email: "test@example.com",
			name: "Temp User",
			role: "user",
			avatarUrl: null,
		};
	},
};
