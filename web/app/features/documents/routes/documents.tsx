import { Link, useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { documentService } from "../domain/documents.service.server";
import type { Document } from "../domain/documents.types";

export function meta() {
	return [{ title: "Documents - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	await requireUserId(request);
	const documents = await documentService.getDocuments();
	return { documents };
}

export default function Documents() {
	const { documents } = useLoaderData<{ documents: Document[] }>();

	return (
		<Shell>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Documents</h1>
					<Link
						to="/documents/new"
						className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
					>
						Add Document
					</Link>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					{documents.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							No documents found. Upload one to get started.
						</div>
					) : (
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Title
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Type
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{documents.map((doc) => (
									<tr key={doc.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{doc.title}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{doc.type}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.status === "final" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
											>
												{doc.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{doc.createdAt?.toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</Shell>
	);
}
