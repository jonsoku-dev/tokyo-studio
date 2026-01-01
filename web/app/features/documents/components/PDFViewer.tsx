/**
 * SPEC 007: PDF Viewer Component
 *
 * In-browser PDF viewer with controls:
 * - Page navigation (prev/next)
 * - Zoom controls (in/out/reset)
 * - Full-page display
 * - Keyboard shortcuts
 */

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
	/** URL or presigned URL of the PDF document */
	documentUrl: string;
	/** Display filename */
	filename: string;
	/** Callback when viewer is closed */
	onClose: () => void;
}

export function PDFViewer({ documentUrl, filename, onClose }: PDFViewerProps) {
	const [numPages, setNumPages] = useState(0);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1.0);
	const [isLoading, setIsLoading] = useState(true);

	const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
	const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
	const resetZoom = () => setScale(1.0);
	const goToNextPage = () =>
		setPageNumber((prev) => Math.min(prev + 1, numPages));
	const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));

	const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
		setIsLoading(false);
	};

	const handleDocumentLoadError = (error: Error) => {
		console.error("PDF load error:", error);
		setIsLoading(false);
	};

	// Keyboard shortcuts
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") goToPrevPage();
		if (e.key === "ArrowRight") goToNextPage();
		if (e.key === "+" || e.key === "=") zoomIn();
		if (e.key === "-" || e.key === "_") zoomOut();
		if (e.key === "0") resetZoom();
		if (e.key === "Escape") onClose();
	};

	return (
		<button
			type="button"
			className="fixed inset-0 z-50 flex flex-col bg-black/95"
			onKeyDown={handleKeyDown}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-gray-700 border-b bg-gray-900 p-4 text-white">
				<h2 className="heading-5 max-w-md truncate" title={filename}>
					{filename}
				</h2>

				<div className="flex items-center gap-6">
					{/* Zoom Controls */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={zoomOut}
							disabled={scale <= 0.5}
							className="rounded p-2 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Zoom out"
						>
							<ZoomOut className="h-5 w-5" />
						</button>
						<span className="min-w-[4rem] text-center text-sm">
							{Math.round(scale * 100)}%
						</span>
						<button
							type="button"
							onClick={zoomIn}
							disabled={scale >= 3.0}
							className="rounded p-2 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Zoom in"
						>
							<ZoomIn className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={resetZoom}
							className="rounded px-3 py-1 text-sm transition-colors hover:bg-gray-800"
						>
							Reset
						</button>
					</div>

					{/* Page Navigation */}
					{numPages > 1 && (
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={goToPrevPage}
								disabled={pageNumber <= 1}
								className="rounded p-2 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Previous page"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<span className="min-w-[8rem] text-center text-sm">
								Page {pageNumber} of {numPages}
							</span>
							<button
								type="button"
								onClick={goToNextPage}
								disabled={pageNumber >= numPages}
								className="rounded p-2 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Next page"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</div>
					)}

					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						className="rounded p-2 transition-colors hover:bg-gray-800"
						aria-label="Close viewer"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* PDF Document */}
			<div className="center flex-1 overflow-auto bg-gray-800 p-8">
				{isLoading && (
					<div className="text-center text-white">
						<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-white border-b-2" />
						<p>Loading PDF...</p>
					</div>
				)}

				<Document
					file={documentUrl}
					onLoadSuccess={handleDocumentLoadSuccess}
					onLoadError={handleDocumentLoadError}
					loading={null} // We handle loading state above
					error={
						<div className="text-center text-white">
							<p className="mb-4 text-red-500">Failed to load PDF</p>
							<p className="text-gray-400 text-sm">
								The PDF file could not be loaded. Please try again or contact
								support.
							</p>
						</div>
					}
				>
					<Page
						pageNumber={pageNumber}
						scale={scale}
						renderTextLayer={true}
						renderAnnotationLayer={true}
						className="shadow-2xl"
					/>
				</Document>
			</div>

			{/* Keyboard Shortcuts Info */}
			<div className="border-gray-700 border-t bg-gray-900 p-2 text-center text-gray-400 text-xs">
				<span className="mr-4 inline-block">Arrow keys: Navigate pages</span>
				<span className="mr-4 inline-block">+/- : Zoom in/out</span>
				<span className="mr-4 inline-block">0: Reset zoom</span>
				<span className="inline-block">Esc: Close</span>
			</div>
		</button>
	);
}
