import { db } from "@itcom/db/client";
import { settlementTemplates } from "@itcom/db/schema";
import { desc, eq } from "drizzle-orm";
import {
	type ActionFunctionArgs,
	data,
	useFetcher,
	useLoaderData,
} from "react-router";

export async function loader() {
	const templates = await db.query.settlementTemplates.findMany({
		with: {
			author: true,
		},
		orderBy: [desc(settlementTemplates.createdAt)],
	});
	return data({ templates });
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const intent = String(formData.get("intent"));
	const templateId = String(formData.get("templateId"));

	if (intent === "verify") {
		await db
			.update(settlementTemplates)
			.set({ isOfficial: true, updatedAt: new Date() })
			.where(eq(settlementTemplates.id, templateId));
		return data({ success: true });
	}

	if (intent === "unverify") {
		await db
			.update(settlementTemplates)
			.set({ isOfficial: false, updatedAt: new Date() })
			.where(eq(settlementTemplates.id, templateId));
		return data({ success: true });
	}

	if (intent === "delete") {
		await db
			.delete(settlementTemplates)
			.where(eq(settlementTemplates.id, templateId));
		return data({ success: true });
	}

	return data({ error: "Unknown intent" }, { status: 400 });
}

export default function AdminSettlementTemplates() {
	const { templates } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">Settlement Templates</h1>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<table className="w-full text-left border-collapse">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Title
							</th>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Author
							</th>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Status
							</th>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Official
							</th>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Created
							</th>
							<th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{templates.map((template) => (
							<tr key={template.id} className="hover:bg-gray-50">
								<td className="px-6 py-4">
									<div className="font-medium text-gray-900">
										{template.title}
									</div>
									<div className="text-xs text-gray-500 line-clamp-1">
										{template.description}
									</div>
								</td>
								<td className="px-6 py-4 text-sm text-gray-600">
									{template.author?.displayName ||
										template.author?.name ||
										"Unknown"}
								</td>
								<td className="px-6 py-4">
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${
											template.status === "published"
												? "bg-green-100 text-green-700"
												: "bg-gray-100 text-gray-600"
										}`}
									>
										{template.status}
									</span>
								</td>
								<td className="px-6 py-4">
									{template.isOfficial ? (
										<span className="text-blue-600 font-bold text-xs">
											OFFICIAL
										</span>
									) : (
										<span className="text-gray-400 text-xs">-</span>
									)}
								</td>
								<td className="px-6 py-4 text-sm text-gray-500">
									{new Date(template.createdAt).toLocaleDateString()}
								</td>
								<td className="px-6 py-4">
									<div className="flex gap-2">
										<fetcher.Form method="post">
											<input
												type="hidden"
												name="templateId"
												value={template.id}
											/>
											{template.isOfficial ? (
												<button
													type="submit"
													name="intent"
													value="unverify"
													className="text-xs text-orange-600 hover:text-orange-800 font-medium"
												>
													Unverify
												</button>
											) : (
												<button
													type="submit"
													name="intent"
													value="verify"
													className="text-xs text-blue-600 hover:text-blue-800 font-medium"
												>
													Verify
												</button>
											)}
										</fetcher.Form>
										<span className="text-gray-300">|</span>
										<fetcher.Form
											method="post"
											onSubmit={(e) =>
												!confirm("Are you sure?") && e.preventDefault()
											}
										>
											<input
												type="hidden"
												name="templateId"
												value={template.id}
											/>
											<button
												type="submit"
												name="intent"
												value="delete"
												className="text-xs text-red-600 hover:text-red-800 font-medium"
											>
												Delete
											</button>
										</fetcher.Form>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
