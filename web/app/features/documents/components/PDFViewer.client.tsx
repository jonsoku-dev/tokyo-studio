import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

/**
 * SPEC 007: Built-in PDF Viewer
 *
 * Features:
 * - In-browser PDF viewing (no download required)
 * - Zoom controls (50% - 300%)
 * - Page navigation
 * - Keyboard shortcuts
 * - Full-screen overlay
 */

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
	/** Presigned URL or document URL */
	documentUrl: string;
	/** Document filename for display */
	filename: string;
	/** Callback when viewer is closed */
	onClose: () => void;
}

export function PDFViewer({ documentUrl, filename, onClose }: PDFViewerProps) {
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [scale, setScale] = useState<number>(1.0);
	const [_loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Zoom controls
	const zoomIn = useCallback(
		() => setScale((prev) => Math.min(prev + 0.25, 3.0)),
		[],
	);
	const zoomOut = useCallback(
		() => setScale((prev) => Math.max(prev - 0.25, 0.5)),
		[],
	);
	const resetZoom = useCallback(() => setScale(1.0), []);

	// Page navigation
	const goToNextPage = useCallback(
		() => setPageNumber((prev) => Math.min(prev + 1, numPages)),
		[numPages],
	);
	const goToPrevPage = useCallback(
		() => setPageNumber((prev) => Math.max(prev - 1, 1)),
		[],
	);
	const goToFirstPage = useCallback(() => setPageNumber(1), []);
	const goToLastPage = useCallback(() => setPageNumber(numPages), [numPages]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "Escape":
					onClose();
					break;
				case "ArrowLeft":
					goToPrevPage();
					break;
				case "ArrowRight":
					goToNextPage();
					break;
				case "Home":
					goToFirstPage();
					break;
				case "End":
					goToLastPage();
					break;
				case "+":
				case "=":
					zoomIn();
					break;
				case "-":
					zoomOut();
					break;
				case "0":
					resetZoom();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		goToFirstPage,
		goToLastPage,
		goToNextPage,
		goToPrevPage,
		onClose,
		resetZoom,
		zoomIn,
		zoomOut,
	]);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		setNumPages(numPages);
		setLoading(false);
	}

	function onDocumentLoadError(error: Error) {
		console.error("PDF load error:", error);
		setError("Failed to load PDF. Please try again.");
		setLoading(false);
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-lg">
				{/* Filename */}
				<h2
					className="heading-5 truncate max-w-md"
					title={filename}
				>
					{filename}
				</h2>

				{/* Controls */}
				<div className="flex items-center gap-6">
					{/* Zoom Controls */}
					<div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
						<button
							type="button"
							onClick={zoomOut}
							disabled={scale <= 0.5}
							className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							aria-label="Zoom out"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Zoom Out</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M20 12H4"
								/>
							</svg>
						</button>
						<span className="text-sm font-mono min-w-[4rem] text-center">
							{Math.round(scale * 100)}%
						</span>
						<button
							type="button"
							onClick={zoomIn}
							disabled={scale >= 3.0}
							className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							aria-label="Zoom in"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Zoom In</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={resetZoom}
							className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
						>
							Reset
						</button>
					</div>

					{/* Page Navigation */}
					{numPages > 1 && (
						<div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
							<button
								type="button"
								onClick={goToFirstPage}
								disabled={pageNumber <= 1}
								className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								aria-label="First page"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>First Page</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								type="button"
								onClick={goToPrevPage}
								disabled={pageNumber <= 1}
								className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								aria-label="Previous page"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Previous Page</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<span className="text-sm font-mono px-2">
								Page {pageNumber} of {numPages}
							</span>
							<button
								type="button"
								onClick={goToNextPage}
								disabled={pageNumber >= numPages}
								className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								aria-label="Next page"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Next Page</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
							<button
								type="button"
								onClick={goToLastPage}
								disabled={pageNumber >= numPages}
								className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								aria-label="Last page"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Last Page</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 5l7 7-7 7M5 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					)}

					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
					>
						Close
					</button>
				</div>
			</div>

			{/* PDF Document */}
			<div className="flex-1 overflow-auto bg-gray-800 center p-8">
				{error ? (
					<div className="text-center">
						<div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
						>
							Close
						</button>
					</div>
				) : (
					<Document
						file={documentUrl}
						onLoadSuccess={onDocumentLoadSuccess}
						onLoadError={onDocumentLoadError}
						loading={
							<div className="text-white text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
								<p>Loading PDF...</p>
							</div>
						}
					>
						<Page
							pageNumber={pageNumber}
							scale={scale}
							renderTextLayer={true}
							renderAnnotationLayer={true}
							loading={
								<div className="bg-white h-[800px] w-[600px] center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
								</div>
							}
						/>
					</Document>
				)}
			</div>

			{/* Keyboard Shortcuts Help */}
			<div className="p-2 bg-gray-900 text-gray-400 text-xs text-center border-t border-gray-800">
				<span className="inline-flex items-center gap-4">
					<span>← → Navigate pages</span>
					<span>+ - Zoom</span>
					<span>0 Reset zoom</span>
					<span>Home/End First/Last page</span>
					<span>ESC Close</span>
				</span>
			</div>
		</div>
	);
}
