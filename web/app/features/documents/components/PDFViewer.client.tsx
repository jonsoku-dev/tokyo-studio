import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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
		<div className="fixed inset-0 z-50 flex flex-col bg-black/90">
			{/* Header */}
			<div className="flex items-center justify-between bg-gray-900 p-responsive text-white shadow-lg">
				{/* Filename */}
				<h2 className="heading-5 max-w-md truncate" title={filename}>
					{filename}
				</h2>

				{/* Controls */}
				<div className="flex items-center gap-responsive">
					{/* Zoom Controls */}
					<div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
						<button
							type="button"
							onClick={zoomOut}
							disabled={scale <= 0.5}
							className="rounded bg-gray-700 px-3 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Zoom out"
						>
							<svg
								className="h-4 w-4"
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
						<span className="min-w-[4rem] text-center font-mono text-sm">
							{Math.round(scale * 100)}%
						</span>
						<button
							type="button"
							onClick={zoomIn}
							disabled={scale >= 3.0}
							className="rounded bg-gray-700 px-3 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Zoom in"
						>
							<svg
								className="h-4 w-4"
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
							className="rounded bg-gray-700 px-3 py-1 text-sm transition-colors hover:bg-gray-600"
						>
							Reset
						</button>
					</div>

					{/* Page Navigation */}
					{numPages > 1 && (
						<div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
							<button
								type="button"
								onClick={goToFirstPage}
								disabled={pageNumber <= 1}
								className="rounded bg-gray-700 px-2 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="First page"
							>
								<svg
									className="h-4 w-4"
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
								className="rounded bg-gray-700 px-2 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Previous page"
							>
								<svg
									className="h-4 w-4"
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
							<span className="px-2 font-mono text-sm">
								Page {pageNumber} of {numPages}
							</span>
							<button
								type="button"
								onClick={goToNextPage}
								disabled={pageNumber >= numPages}
								className="rounded bg-gray-700 px-2 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Next page"
							>
								<svg
									className="h-4 w-4"
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
								className="rounded bg-gray-700 px-2 py-1 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Last page"
							>
								<svg
									className="h-4 w-4"
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
						className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Close
					</button>
				</div>
			</div>

			{/* PDF Document */}
			<div className="center flex-1 overflow-auto bg-gray-800 p-responsive">
				{error ? (
					<div className="text-center">
						<div className="mb-4 text-red-500 text-xl">⚠️ {error}</div>
						<button
							type="button"
							onClick={onClose}
							className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
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
							<div className="text-center text-white">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-white border-b-2" />
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
								<div className="center h-[800px] w-[600px] bg-white">
									<div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
								</div>
							}
						/>
					</Document>
				)}
			</div>

			{/* Keyboard Shortcuts Help */}
			<div className="border-gray-800 border-t bg-gray-900 p-2 text-center text-gray-400 text-xs">
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
