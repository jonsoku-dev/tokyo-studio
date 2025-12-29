import { Outlet, type LoaderFunctionArgs } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { requireUserId } from "~/features/auth/utils/session.server";

/**
 * ProtectedLayout - For pages that require authentication
 * User must be logged in to access these pages
 */
export async function loader({ request }: LoaderFunctionArgs) {
	// This will redirect to /login if user is not authenticated
	await requireUserId(request);
	return {};
}

export function ProtectedLayout() {
	return (
		<div className="min-h-screen bg-gray-100 flex flex-col">
			<Navbar />
			<div className="flex flex-1 max-w-7xl w-full mx-auto">
				<aside className="hidden md:block w-64 py-6 pr-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
					<Sidebar />
				</aside>
				<main className="flex-1 py-6 px-4 md:px-0 min-w-0">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
