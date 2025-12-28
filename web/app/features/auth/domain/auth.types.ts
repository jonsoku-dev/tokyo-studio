import { z } from "zod";
import { selectUserSchema } from "~/shared/db/schema";

// Extend generated schema or pick fields as needed
export const UserSchema = selectUserSchema.pick({
	id: true,
	email: true,
	name: true,
	role: true,
	avatarUrl: true,
});
// .extend({ ... }) if needed

export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(2, "Name must be at least 2 characters"),
});

export type SignupDTO = z.infer<typeof SignupSchema>;

export interface AuthResponse {
	user: User;
	token: string;
}
