import { type LoaderFunctionArgs, Outlet } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Shell } from "../components/layout/Shell";

/**
 * ProtectedLayout - For pages that require authentication
 * User must be logged in to access these pages
 */
export async function loader({ request }: LoaderFunctionArgs) {
	// This will redirect to /login if user is not authenticated
	await requireUserId(request);
	return {};
}

export default function ProtectedLayout() {
	return (
		<Shell showSidebar>
			<Outlet />
		</Shell>
	);
}
