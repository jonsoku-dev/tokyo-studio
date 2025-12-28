import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../domain/auth.types";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	isLoading: boolean;

	// Actions
	setAuth: (user: User, token: string) => void;
	clearAuth: () => void;
	setLoading: (isLoading: boolean) => void;
	updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			token: null,
			isLoading: true, // Default to true until we check status

			setAuth: (user, token) =>
				set({ user, isAuthenticated: true, token, isLoading: false }),

			clearAuth: () =>
				set({
					user: null,
					isAuthenticated: false,
					token: null,
					isLoading: false,
				}),

			setLoading: (isLoading) => set({ isLoading }),

			updateUser: (updates) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				})),
		}),
		{
			name: "auth-storage", // keys for localStorage
			partialize: (state) => ({ token: state.token }), // Only persist token
		},
	),
);
