import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { count } from "drizzle-orm";
import type { Route } from "./+types/home";

export function meta() {
	return [{ title: "Admin Dashboard" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	// Basic connectivity test
	const result = await db.select({ count: count() }).from(users);
	return { userCount: result[0].count };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div className="min-h-screen bg-gray-50 p-responsive">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-responsive">
				<div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-200">
					<h3 className="text-sm font-medium text-gray-500 mb-2">
						Total Users
					</h3>
					<p className="text-3xl font-bold text-gray-900">
						{loaderData.userCount}
					</p>
				</div>
			</div>
		</div>
	);
}
