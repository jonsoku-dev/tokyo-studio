import { FileText, Filter, Plus, Search } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useFetcher, useSearchParams, useSubmit } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { DocumentGrid } from "~/features/documents/components/DocumentGrid";
import { DocumentPreview } from "~/features/documents/components/DocumentPreview";
import { documentsService } from "~/features/documents/services/documents.server";
import type { SelectDocument } from "~/features/documents/services/types";
import {
	validateDocumentStatus,
	validateDocumentType,
	validatePaginationParams,
	validateSearchQuery,
} from "~/features/documents/validation";
import { FileUploader } from "~/features/storage/components/FileUploader";
import { StorageUsageCompact } from "~/features/storage/components/StorageUsageIndicator";
import { getDownloadUrl } from "~/features/storage/services/s3-upload.client";
import { storageService } from "~/features/storage/services/storage.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { BadRequestError } from "~/shared/lib";
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

	// Parse and validate pagination params
	const pageParam = url.searchParams.get("page");
	const pageSizeParam = url.searchParams.get("pageSize");

	const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
	const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 20;

	// Validate pagination
	const paginationValidation = validatePaginationParams(page, pageSize);
	if (!paginationValidation.valid) {
		throw new BadRequestError(
			paginationValidation.error ?? "Invalid pagination parameters",
		);
	}

	// Validate search query
	if (query) {
		const queryValidation = validateSearchQuery(query);
		if (!queryValidation.valid) {
			throw new BadRequestError(
				queryValidation.error ?? "Invalid search query",
			);
		}
	}

	// Validate document type filter
	if (type && type !== "All") {
		const typeValidation = validateDocumentType(type);
		if (!typeValidation.valid) {
			throw new BadRequestError(
				typeValidation.error ?? "Invalid document type",
			);
		}
	}

	// Validate status filter
	if (status && status !== "All") {
		const statusValidation = validateDocumentStatus(status);
		if (!statusValidation.valid) {
			throw new BadRequestError(statusValidation.error ?? "Invalid status");
		}
	}

	// Calculate offset
	const offset = (page - 1) * pageSize;

	const { documents: files, totalCount } =
		await documentsService.searchDocuments(userId, {
			query,
			type,
			status,
			limit: pageSize,
			offset,
		});

	const usedQuota = await storageService.getUsedQuota(userId);

	// Calculate pagination metadata
	const totalPages = Math.ceil(totalCount / pageSize);
	const pagination = {
		page,
		pageSize,
		totalCount,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};

	return { files, usedQuota, pagination };
}

export default function Documents({ loaderData }: Route.ComponentProps) {
	const { files, usedQuota, pagination } = loaderData;
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
	const _usedMB = (usedQuota / (1024 * 1024)).toFixed(1);
	const _totalMB = 100;
	const _percentUsed = Math.min((usedQuota / (100 * 1024 * 1024)) * 100, 100);

	return (
		<div className="stack-lg">
			{/* Header & Stats */}
			{/* Header & Stats */}
			<PageHeader
				title="Documents"
				description="Manage your career documents with version control."
				actions={
					<div className="flex items-center gap-6">
						<div className="hidden sm:block">
							<p className="mb-2 text-right font-medium text-gray-500 text-xs">
								Storage
							</p>
							<StorageUsageCompact storageUsed={usedQuota} />
						</div>
						<Button onClick={() => setIsUploadOpen(!isUploadOpen)}>
							<Plus className="mr-2 h-4 w-4" />
							Upload New
						</Button>
					</div>
				}
			>
				{/* Upload Expandable Area */}
				{isUploadOpen && (
					<div className="card slide-in-from-top-4 fade-in mt-4 animate-in border border-gray-100 p-6 duration-200">
						<h2 className="heading-5 mb-4">Upload Documents</h2>
						<FileUploader
							onUploadComplete={() => {
								// revalidate
								submit(searchParams);
							}}
						/>
					</div>
				)}
			</PageHeader>

			{/* Search & Filter Toolbar */}
			<div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<form
						onChange={(e) => handleSearch(e.currentTarget)}
						onSubmit={(e) => e.preventDefault()}
					>
						<input
							type="text"
							name="q"
							defaultValue={searchParams.get("q") || ""}
							placeholder="Search documents..."
							className="w-full rounded-md border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-primary-500 focus:ring-primary-500"
						/>
					</form>
				</div>
				<div className="flex gap-2">
					<div className="relative">
						<select
							className="appearance-none rounded-md border-gray-200 bg-white py-2 pr-8 pl-3 text-sm focus:border-primary-500 focus:ring-primary-500"
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
						<Filter className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
					</div>
					<div className="relative">
						<select
							className="appearance-none rounded-md border-gray-200 bg-white py-2 pr-8 pl-3 text-sm focus:border-primary-500 focus:ring-primary-500"
							value={searchParams.get("status") || "All"}
							onChange={(e) => handleFilterChange("status", e.target.value)}
						>
							<option value="All">All Status</option>
							<option value="draft">Draft</option>
							<option value="final">Final</option>
						</select>
						<Filter className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
					</div>
				</div>
			</div>

			{/* Document Grid */}
			{files.length === 0 ? (
				<div className="rounded-lg border border-gray-300 border-dashed bg-white py-20 text-center">
					<FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
					<h3 className="heading-5">No documents found</h3>
					<p className="mt-1 text-gray-500">
						Try adjusting your filters or upload a new document.
					</p>
				</div>
			) : (
				<DocumentGrid
					documents={files as SelectDocument[]}
					pagination={pagination}
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
						<div className="center fixed inset-0 z-50 bg-black/90">
							<div className="text-center text-white">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-white border-b-2" />
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
	);
}
