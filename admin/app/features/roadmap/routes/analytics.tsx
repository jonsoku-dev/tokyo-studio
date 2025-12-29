/**
 * Admin Analytics Page
 * /admin/roadmap/analytics
 */
import { data } from "react-router";
import {
	getCategoryBreakdown,
	getRoadmapFunnel,
	getUsersAtStage,
} from "../services/admin-roadmap.server";
import type { Route } from "./+types/analytics";
import { requireAdmin } from "~/features/auth/utils/session.server";

// ============================================
// Loader
// ============================================
export async function loader({ request }: Route.LoaderArgs) {
	await requireAdmin(request);
	const funnel = await getRoadmapFunnel();
	const categoryBreakdown = await getCategoryBreakdown();

	// Get sample users at each stage
	const usersAtGenerated = await getUsersAtStage("generated", 5);
	const usersAtFirstTask = await getUsersAtStage("firstTask", 5);

	return data({
		funnel,
		categoryBreakdown,
		sampleUsers: {
			generated: usersAtGenerated,
			firstTask: usersAtFirstTask,
		},
	});
}

// ============================================
// Component
// ============================================
export default function AnalyticsPage({ loaderData }: Route.ComponentProps) {
	const { funnel, categoryBreakdown, sampleUsers } = loaderData;

	const funnelStages = [
		{
			label: "Roadmap Generated",
			value: funnel.generated,
			color: "bg-blue-500",
		},
		{
			label: "First Task Done",
			value: funnel.firstTask,
			color: "bg-green-500",
		},
		{
			label: "50% Complete",
			value: funnel.fiftyPercent,
			color: "bg-yellow-500",
		},
		{ label: "Fully Complete", value: funnel.complete, color: "bg-purple-500" },
	];

	const maxFunnel = Math.max(funnel.generated, 1);

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Roadmap Analytics</h1>
				<p className="text-sm text-gray-500 mt-1">
					User progress through roadmap stages
				</p>
			</div>

			<div className="grid grid-cols-2 gap-6">
				{/* Funnel Chart */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Completion Funnel
					</h2>

					<div className="space-y-4">
						{funnelStages.map((stage, index) => {
							const widthPercent = (stage.value / maxFunnel) * 100;
							const conversionRate =
								index > 0 && funnelStages[index - 1].value > 0
									? (
											(stage.value / funnelStages[index - 1].value) *
											100
										).toFixed(1)
									: null;

							return (
								<div key={stage.label}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="font-medium text-gray-700">
											{stage.label}
										</span>
										<span className="text-gray-500">
											{stage.value}
											{conversionRate && (
												<span className="ml-2 text-xs text-gray-400">
													({conversionRate}% from prev)
												</span>
											)}
										</span>
									</div>
									<div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
										<div
											className={`h-full ${stage.color} transition-all duration-500`}
											style={{ width: `${Math.max(widthPercent, 2)}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Category Breakdown */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Category Breakdown
					</h2>

					<div className="space-y-4">
						{(
							Object.entries(categoryBreakdown) as [
								string,
								{ total: number; completed: number },
							][]
						).map(([category, data]) => {
							const percentage =
								data.total > 0
									? Math.round((data.completed / data.total) * 100)
									: 0;

							const categoryColors: Record<string, string> = {
								Learning: "bg-blue-500",
								Application: "bg-green-500",
								Preparation: "bg-yellow-500",
								Settlement: "bg-purple-500",
							};

							return (
								<div key={category}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="font-medium text-gray-700">
											{category}
										</span>
										<span className="text-gray-500">
											{data.completed} / {data.total} ({percentage}%)
										</span>
									</div>
									<div className="h-4 bg-gray-100 rounded-full overflow-hidden">
										<div
											className={`h-full ${categoryColors[category] || "bg-gray-500"} transition-all duration-500`}
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Summary Stats */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-2">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Summary Statistics
					</h2>

					<div className="grid grid-cols-4 gap-4">
						<div className="text-center p-4 bg-blue-50 rounded-lg">
							<div className="text-3xl font-bold text-blue-600">
								{funnel.generated}
							</div>
							<div className="text-sm text-gray-600">Total Roadmaps</div>
						</div>
						<div className="text-center p-4 bg-green-50 rounded-lg">
							<div className="text-3xl font-bold text-green-600">
								{funnel.generated > 0
									? Math.round((funnel.firstTask / funnel.generated) * 100)
									: 0}
								%
							</div>
							<div className="text-sm text-gray-600">Started Tasks</div>
						</div>
						<div className="text-center p-4 bg-yellow-50 rounded-lg">
							<div className="text-3xl font-bold text-yellow-600">
								{funnel.generated > 0
									? Math.round((funnel.fiftyPercent / funnel.generated) * 100)
									: 0}
								%
							</div>
							<div className="text-sm text-gray-600">Half Complete</div>
						</div>
						<div className="text-center p-4 bg-purple-50 rounded-lg">
							<div className="text-3xl font-bold text-purple-600">
								{funnel.generated > 0
									? Math.round((funnel.complete / funnel.generated) * 100)
									: 0}
								%
							</div>
							<div className="text-sm text-gray-600">Fully Complete</div>
						</div>
					</div>
				</div>

				{/* Sample Users */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-2">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Users with Roadmaps
					</h2>

					{sampleUsers.generated.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
											Email
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
											Name
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{sampleUsers.generated.map((user) => (
										<tr key={user.id}>
											<td className="px-4 py-2 text-sm text-gray-900">
												{user.email}
											</td>
											<td className="px-4 py-2 text-sm text-gray-500">
												{user.name}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-center text-gray-500 py-4">
							No users have generated roadmaps yet.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
