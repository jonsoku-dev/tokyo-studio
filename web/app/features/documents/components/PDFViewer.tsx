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
			className="fixed inset-0 z-50 bg-black/95 flex flex-col"
			onKeyDown={handleKeyDown}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700">
				<h2
					className="heading-5 truncate max-w-md"
					title={filename}
				>
					{filename}
				</h2>

				<div className="flex items-center gap-6">
					{/* Zoom Controls */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={zoomOut}
							disabled={scale <= 0.5}
							className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
							className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							aria-label="Zoom in"
						>
							<ZoomIn className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={resetZoom}
							className="px-3 py-1 text-sm hover:bg-gray-800 rounded transition-colors"
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
								className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
								className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
						className="p-2 hover:bg-gray-800 rounded transition-colors"
						aria-label="Close viewer"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* PDF Document */}
			<div className="flex-1 overflow-auto bg-gray-800 center p-8">
				{isLoading && (
					<div className="text-white text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
						<p>Loading PDF...</p>
					</div>
				)}

				<Document
					file={documentUrl}
					onLoadSuccess={handleDocumentLoadSuccess}
					onLoadError={handleDocumentLoadError}
					loading={null} // We handle loading state above
					error={
						<div className="text-white text-center">
							<p className="text-red-500 mb-4">Failed to load PDF</p>
							<p className="text-sm text-gray-400">
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
			<div className="p-2 bg-gray-900 text-gray-400 text-xs text-center border-t border-gray-700">
				<span className="inline-block mr-4">Arrow keys: Navigate pages</span>
				<span className="inline-block mr-4">+/- : Zoom in/out</span>
				<span className="inline-block mr-4">0: Reset zoom</span>
				<span className="inline-block">Esc: Close</span>
			</div>
		</button>
	);
}
