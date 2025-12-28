import { useAuthStore } from "../store/auth.store";

export function useUser() {
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);

	return {
		user,
		isAuthenticated,
		isLoading,
	};
}
