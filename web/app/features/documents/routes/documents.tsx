import { FileText, Filter, Plus, Search } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useFetcher, useSearchParams, useSubmit } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { DocumentGrid } from "~/features/documents/components/DocumentGrid";
import { DocumentPreview } from "~/features/documents/components/DocumentPreview";
import { documentsService } from "~/features/documents/services/documents.server";
import type { SelectDocument } from "~/features/documents/services/types";
import { FileUploader } from "~/features/storage/components/FileUploader";
import { StorageUsageCompact } from "~/features/storage/components/StorageUsageIndicator";
import { getDownloadUrl } from "~/features/storage/services/s3-upload.client";
import { storageService } from "~/features/storage/services/storage.server";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import type { Route } from "./+types/documents";

// Lazy load PDF Viewer to reduce initial bundle size
const PDFViewer = lazy(() =>
	import("~/features/documents/components/PDFViewer.client").then((m) => ({
		default: m.PDFViewer,
	})),
);

export function meta() {
	return [{ title: "Documents - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const url = new URL(request.url);
	const query = url.searchParams.get("q") || undefined;
	const type = url.searchParams.get("type") || undefined;
	const status = url.searchParams.get("status") || undefined;

	const files = await documentsService.searchDocuments(userId, {
		query,
		type,
		status,
	});

	const usedQuota = await storageService.getUsedQuota(userId);

	return { files, usedQuota };
}

export default function Documents({ loaderData }: Route.ComponentProps) {
	const { files, usedQuota } = loaderData;
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const submit = useSubmit();

	const [previewDoc, setPreviewDoc] = useState<SelectDocument | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [isUploadOpen, setIsUploadOpen] = useState(false);

	// Fetch download URL when previewing a PDF
	useEffect(() => {
		if (previewDoc && previewDoc.mimeType === "application/pdf") {
			getDownloadUrl(previewDoc.id).then((url) => {
				if (url) setPdfUrl(url);
			});
		} else {
			setPdfUrl(null);
		}
	}, [previewDoc]);

	// Filters
	const handleSearch = (form: HTMLFormElement) => {
		submit(form);
	};

	const handleFilterChange = (key: string, value: string) => {
		const newParams = new URLSearchParams(searchParams);
		if (value && value !== "All") {
			newParams.set(key, value);
		} else {
			newParams.delete(key);
		}
		submit(newParams);
	};

	// Actions
	const handleRename = (id: string, newTitle: string) => {
		fetcher.submit(
			{ title: newTitle },
			{ method: "PATCH", action: `/api/documents/${id}` },
		);
	};

	const handleStatusChange = (id: string, newStatus: string) => {
		fetcher.submit(
			{ status: newStatus },
			{ method: "PATCH", action: `/api/documents/${id}` },
		);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this document?")) {
			fetcher.submit(
				{ intent: "delete", documentId: id },
				{ method: "POST", action: "/api/storage/files" },
			);
		}
	};

	// Calculate formatted quota
	const usedMB = (usedQuota / (1024 * 1024)).toFixed(1);
	const totalMB = 100;
	const percentUsed = Math.min((usedQuota / (100 * 1024 * 1024)) * 100, 100);

	return (
		<Shell>
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Header & Stats */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Documents</h1>
						<p className="mt-1 text-sm text-gray-500">
							Manage your career documents with version control.
						</p>
					</div>

					<div className="flex items-center gap-6">
						<div className="hidden sm:block">
							<p className="mb-2 text-right text-xs font-medium text-gray-500">
								Storage
							</p>
							<StorageUsageCompact storageUsed={usedQuota} />
						</div>
						<Button onClick={() => setIsUploadOpen(!isUploadOpen)}>
							<Plus className="h-4 w-4 mr-2" />
							Upload New
						</Button>
					</div>
				</div>

				{/* Upload Expandable Area */}
				{isUploadOpen && (
					<div className="bg-white rounded-lg shadow p-6 border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-200">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Upload Documents
						</h2>
						<FileUploader
							onUploadComplete={() => {
								// revalidate
								submit(searchParams);
							}}
						/>
					</div>
				)}

				{/* Search & Filter Toolbar */}
				<div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<form
							onChange={(e) => handleSearch(e.currentTarget)}
							onSubmit={(e) => e.preventDefault()}
						>
							<input
								type="text"
								name="q"
								defaultValue={searchParams.get("q") || ""}
								placeholder="Search documents..."
								className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-md focus:ring-orange-500 focus:border-orange-500"
							/>
						</form>
					</div>
					<div className="flex gap-2">
						<div className="relative">
							<select
								className="pl-3 pr-8 py-2 text-sm border-gray-200 rounded-md focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
								value={searchParams.get("type") || "All"}
								onChange={(e) => handleFilterChange("type", e.target.value)}
							>
								<option value="All">All Types</option>
								<option value="Resume">Resume</option>
								<option value="CV">CV</option>
								<option value="Portfolio">Portfolio</option>
								<option value="Cover Letter">Cover Letter</option>
								<option value="Other">Other</option>
							</select>
							<Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
						</div>
						<div className="relative">
							<select
								className="pl-3 pr-8 py-2 text-sm border-gray-200 rounded-md focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
								value={searchParams.get("status") || "All"}
								onChange={(e) => handleFilterChange("status", e.target.value)}
							>
								<option value="All">All Status</option>
								<option value="draft">Draft</option>
								<option value="final">Final</option>
							</select>
							<Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
						</div>
					</div>
				</div>

				{/* Document Grid */}
				{files.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
						<FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
						<h3 className="text-lg font-medium text-gray-900">
							No documents found
						</h3>
						<p className="text-gray-500 mt-1">
							Try adjusting your filters or upload a new document.
						</p>
					</div>
				) : (
					<DocumentGrid
						documents={files as SelectDocument[]}
						onRename={handleRename}
						onStatusChange={handleStatusChange}
						onDelete={handleDelete}
						onPreview={setPreviewDoc}
					/>
				)}

				{/* Preview - PDF Viewer for PDFs, Document Preview for others */}
				{previewDoc?.mimeType === "application/pdf" && pdfUrl ? (
					<Suspense
						fallback={
							<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
								<div className="text-white text-center">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
									<p>Loading PDF Viewer...</p>
								</div>
							</div>
						}
					>
						<PDFViewer
							documentUrl={pdfUrl}
							filename={previewDoc.title}
							onClose={() => {
								setPreviewDoc(null);
								setPdfUrl(null);
							}}
						/>
					</Suspense>
				) : (
					<DocumentPreview
						isOpen={!!previewDoc && previewDoc.mimeType !== "application/pdf"}
						onClose={() => setPreviewDoc(null)}
						document={previewDoc}
					/>
				)}
			</div>
		</Shell>
	);
}
