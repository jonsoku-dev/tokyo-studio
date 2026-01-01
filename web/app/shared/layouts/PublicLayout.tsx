import { Outlet } from "react-router";

/**
 * PublicLayout - For pages accessible without authentication
 * Used for: login, signup, forgot-password, etc.
 */
export default function PublicLayout() {
	return (
		<div className="min-h-screen bg-gray-100">
			<Outlet />
		</div>
	);
}
