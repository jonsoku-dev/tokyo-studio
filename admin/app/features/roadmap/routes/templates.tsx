/**
 * Admin Template List Page
 * /admin/roadmap/templates
 */
import { data, Link, useFetcher } from "react-router";
import {
	deleteTemplate,
	listTemplates,
	updateTemplate,
} from "../services/admin-roadmap.server";
import { requireAdmin } from "~/features/auth/utils/session.server";
import type { Route } from "./+types/templates";

// ============================================
// Loader
// ============================================
export async function loader({ request }: Route.LoaderArgs) {
	await requireAdmin(request);
	const url = new URL(request.url);
	const category = url.searchParams.get("category") || undefined;
	const activeOnly = url.searchParams.get("activeOnly") === "true";

	const templates = await listTemplates({
		category,
		isActive: activeOnly ? true : undefined,
	});

	return data({ templates, filters: { category, activeOnly } });
}

// ============================================
// Action
// ============================================
export async function action({ request }: Route.ActionArgs) {
	await requireAdmin(request);
	const formData = await request.formData();
	const intent = formData.get("intent");
	const id = formData.get("id") as string;
	const adminId = "admin"; // TODO: Get from session

	switch (intent) {
		case "delete":
			await deleteTemplate(id, adminId);
			return data({ success: true, action: "deleted" });

		case "toggleActive": {
			const isActive = formData.get("isActive") === "true";
			await updateTemplate(id, { isActive: !isActive }, adminId);
			return data({ success: true, action: "toggled" });
		}

		default:
			return data({ error: "Unknown action" }, { status: 400 });
	}
}

// ============================================
// Component
// ============================================
export default function TemplateListPage({ loaderData }: Route.ComponentProps) {
	const { templates, filters } = loaderData;
	const fetcher = useFetcher();

	const categoryColors: Record<string, string> = {
		Learning: "bg-blue-100 text-blue-800",
		Application: "bg-green-100 text-green-800",
		Preparation: "bg-yellow-100 text-yellow-800",
		Settlement: "bg-purple-100 text-purple-800",
	};

	const priorityBadges: Record<string, string> = {
		urgent: "bg-red-100 text-red-800",
		normal: "bg-gray-100 text-gray-800",
		low: "bg-gray-50 text-gray-600",
	};

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Roadmap Templates
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						Manage roadmap task templates
					</p>
				</div>
				<Link
					to="/roadmap/templates/new"
					className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					+ New Template
				</Link>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
				<form method="get" className="flex items-center gap-4">
					<div>
						<label
							htmlFor="category-select"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Category
						</label>
						<select
							id="category-select"
							name="category"
							defaultValue={filters.category || ""}
							className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						>
							<option value="">All Categories</option>
							<option value="Learning">Learning</option>
							<option value="Application">Application</option>
							<option value="Preparation">Preparation</option>
							<option value="Settlement">Settlement</option>
						</select>
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="activeOnly"
							name="activeOnly"
							value="true"
							defaultChecked={filters.activeOnly}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<label htmlFor="activeOnly" className="text-sm text-gray-700">
							Active Only
						</label>
					</div>
					<button
						type="submit"
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
					>
						Filter
					</button>
				</form>
			</div>

			{/* Template Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								#
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Title
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Priority
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Time (min)
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{templates.map((template, index) => (
							<tr
								key={template.id}
								className={`${!template.isActive ? "opacity-50" : ""}`}
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{index + 1}
								</td>
								<td className="px-6 py-4">
									<div className="text-sm font-medium text-gray-900">
										{template.title}
									</div>
									<div className="text-sm text-gray-500 truncate max-w-xs">
										{template.description}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 py-1 text-xs rounded-full ${categoryColors[template.category] || "bg-gray-100 text-gray-800"}`}
									>
										{template.category}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 py-1 text-xs rounded-full ${priorityBadges[template.priority] || "bg-gray-100"}`}
									>
										{template.priority}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{template.estimatedMinutes}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 py-1 text-xs rounded-full ${template.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
									>
										{template.isActive ? "Active" : "Inactive"}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
									<Link
										to={`/roadmap/templates/${template.id}`}
										className="text-indigo-600 hover:text-indigo-900"
									>
										Edit
									</Link>
									<fetcher.Form method="post" className="inline">
										<input type="hidden" name="id" value={template.id} />
										<input
											type="hidden"
											name="isActive"
											value={String(template.isActive)}
										/>
										<button
											type="submit"
											name="intent"
											value="toggleActive"
											className="text-yellow-600 hover:text-yellow-900"
										>
											{template.isActive ? "Deactivate" : "Activate"}
										</button>
									</fetcher.Form>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{templates.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						No templates found. Create your first template!
					</div>
				)}
			</div>
		</div>
	);
}
