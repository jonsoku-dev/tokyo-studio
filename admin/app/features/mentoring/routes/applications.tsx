import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { Check, ChevronRight, Download, FileText, X } from "lucide-react";
import { Form, Link, useNavigation, useSearchParams } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { applicationService } from "~/features/mentoring/services/application.server";
import type { Route } from "./+types/applications";

// Re-implementing requireAdmin locally or ensuring session.server exports it.
// If session.server.ts was copied from web, and I reverted requireAdmin there, I need to add it back here!
async function requireAdmin(request: Request) {
	const userId = await requireUserId(request);
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	if (!user || user.role !== "admin") {
		throw new Response("Unauthorized", { status: 403 });
	}
	return userId;
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireAdmin(request);
	const applications = await applicationService.getApplications();

	// Check for selected app ID
	const url = new URL(request.url);
	const selectedId = url.searchParams.get("id");
	let signedFileUrl: string | null = null;

	if (selectedId) {
		const app = applications.find((a) => a.id === selectedId);
		if (app?.verificationFileUrl) {
			// In Admin, we might rely on a resource route or S3 Presigned URL directly.
			// For now, let's just return the key, or we need storageService.
			// implementation_plan said: signedFileUrl via storageService.
			// But storageService in admin is not fully wired for presigned GET yet (mock only locally).
			// We'll pass the key and let UI decide.
			// Or better, implement `getPresignedUrl` properly in admin storage service.
			// For MVP, if local, it serves from filesystem. Admin needs access to `storage/private`?
			// If they are on same machine (local dev), yes.
			// We'll assume local dev for now.
			signedFileUrl = `/admin/resources/verification?key=${encodeURIComponent(app.verificationFileUrl)}`;
		}
	}

	return { applications, signedFileUrl };
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireAdmin(request);
	const formData = await request.formData();
	const intent = formData.get("intent");
	const applicationId = formData.get("applicationId") as string;
	const rejectionReason = formData.get("rejectionReason") as string;

	if (intent === "approve") {
		await applicationService.processApplication(
			userId,
			applicationId,
			"approved",
		);
	} else if (intent === "reject") {
		await applicationService.processApplication(
			userId,
			applicationId,
			"rejected",
			rejectionReason,
		);
	}

	return { success: true };
}

export default function AdminApplicationsPage({
	loaderData,
}: Route.ComponentProps) {
	const { applications, signedFileUrl } = loaderData;
	const [searchParams] = useSearchParams();
	const selectedId = searchParams.get("id");
	const selectedApp = applications.find((a) => a.id === selectedId);
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold mb-6 text-gray-900">
				Mentor Applications
			</h2>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* List */}
				<div className="lg:col-span-1 space-y-4">
					{applications.map((app) => (
						<Link
							key={app.id}
							to={`?id=${app.id}`}
							className={`block p-4 rounded-xl border transition-colors ${
								selectedId === app.id
									? "bg-blue-50 border-blue-200"
									: "bg-white border-gray-200 hover:bg-gray-50"
							}`}
						>
							<div className="flex justify-between items-start mb-2">
								<div>
									<h3 className="font-semibold text-gray-900">
										{app.user.name}
									</h3>
									<p className="text-sm text-gray-500">
										{app.jobTitle} @ {app.company}
									</p>
								</div>
								<Badge status={app.status} />
							</div>
							<div className="text-xs text-gray-400 flex justify-between">
								<span>{format(new Date(app.createdAt), "MMM d, yyyy")}</span>
								<ChevronRight className="h-4 w-4" />
							</div>
						</Link>
					))}
					{applications.length === 0 && (
						<p className="text-gray-500 text-center py-8">
							No applications found.
						</p>
					)}
				</div>

				{/* Detail */}
				<div className="lg:col-span-2">
					{selectedApp ? (
						<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
							<div className="flex justify-between items-start mb-6">
								<div>
									<h2 className="text-xl font-bold text-gray-900">
										{selectedApp.user.name}
									</h2>
									<p className="text-gray-500">
										{selectedApp.jobTitle} @ {selectedApp.company}
									</p>
								</div>
								<div className="flex flex-col items-end gap-2">
									<Badge status={selectedApp.status} />
									<p className="text-xs text-gray-400">ID: {selectedApp.id}</p>
								</div>
							</div>

							<div className="space-y-6">
								<Section title="Professional Background">
									<p className="text-gray-700">
										<span className="text-gray-500">Experience:</span>{" "}
										{selectedApp.yearsOfExperience} Years
									</p>
									<p className="text-gray-700">
										<span className="text-gray-500">LinkedIn:</span>{" "}
										<a
											href={selectedApp.linkedinUrl || "#"}
											target="_blank"
											rel="noreferrer"
											className="text-blue-600 hover:underline"
										>
											{selectedApp.linkedinUrl || "N/A"}
										</a>
									</p>
								</Section>

								<Section title="Expertise & Languages">
									<div className="flex flex-wrap gap-2 mb-2">
										{selectedApp.expertise.map((t) => (
											<span
												key={t}
												className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
											>
												{t}
											</span>
										))}
									</div>
									<div className="flex flex-wrap gap-2">
										{Object.entries(
											selectedApp.languages as Record<string, string>,
										).map(([lang, level]) => (
											<span
												key={lang}
												className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
											>
												{lang}: {level}
											</span>
										))}
									</div>
								</Section>

								<Section title="Motivation">
									<p className="text-gray-700 whitespace-pre-wrap">
										{selectedApp.bio}
									</p>
								</Section>

								<Section title="Verification Document">
									<div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
										<FileText className="h-8 w-8 text-gray-400" />
										<div className="flex-1 overflow-hidden">
											<p className="text-sm font-medium truncate text-gray-900">
												{selectedApp.verificationFileUrl}
											</p>
											<p className="text-xs text-gray-500">Secure File</p>
										</div>
										<a
											href={signedFileUrl || "#"}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 rounded text-sm transition-colors"
										>
											<Download className="h-4 w-4" /> Download
										</a>
									</div>
									<p className="text-xs text-yellow-600 mt-2">
										* This link is generated for admin access only.
									</p>
								</Section>

								{/* Actions */}
								{(selectedApp.status === "pending" ||
									selectedApp.status === "under_review") && (
									<div className="pt-6 border-t border-gray-200 flex gap-4 justify-end">
										<Form method="post" className="flex gap-2 items-center">
											<input
												type="hidden"
												name="applicationId"
												value={selectedApp.id}
											/>

											{/* Simple Rejection for MVP */}
											<div className="flex items-center gap-2">
												<input
													type="text"
													name="rejectionReason"
													placeholder="Rejection reason (if rejecting)"
													className="border rounded px-2 py-1 text-sm w-48"
												/>
												<button
													type="submit"
													name="intent"
													value="reject"
													className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2"
													disabled={isSubmitting}
												>
													<X className="h-4 w-4" /> Reject
												</button>
											</div>
											<button
												type="submit"
												name="intent"
												value="approve"
												className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2"
												disabled={isSubmitting}
											>
												<Check className="h-4 w-4" /> Approve Application
											</button>
										</Form>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
							<p className="text-gray-500">Select an application to review</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function Badge({ status }: { status: string }) {
	const colors = {
		pending: "bg-yellow-100 text-yellow-800",
		under_review: "bg-blue-100 text-blue-800",
		approved: "bg-green-100 text-green-800",
		rejected: "bg-red-100 text-red-800",
	};
	const color =
		colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
	return (
		<span
			className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${color}`}
		>
			{status.replace("_", " ")}
		</span>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
				{title}
			</h4>
			<div className="text-sm">{children}</div>
		</div>
	);
}
