import { Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import { PARSING_PLUGINS } from "../constants/parsing-plugins";
import type { ParsingPluginConfig } from "../domain/parsing.types";
import type { PipelineItem, PipelineStage } from "../domain/pipeline.types";

interface PipelineItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	stages: PipelineStage[];
	parsers: ParsingPluginConfig[];
	initialData?: PipelineItem | null;
}

/**
 * Modal for creating or editing a pipeline item.
 *
 * Design principles:
 * - Zero useEffect (pure derivation)
 * - Derived state from fetcher.data
 * - Form reset via key prop pattern (remount = fresh state)
 * - Composition-based using shared Dialog components
 */
export function PipelineItemModal({
	isOpen,
	onClose,
	stages,
	parsers,
	initialData,
}: PipelineItemModalProps) {
	// Key increments on close to reset form state on next open
	// Also dependents on initialData.id to reset when switching items
	const [formKey, setFormKey] = useState(0);

	const handleClose = () => {
		setFormKey((k) => k + 1);
		onClose();
	};

	const key = `${formKey}-${initialData?.id || "new"}`;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			{/* key forces remount = fresh form state */}
			<DialogContent key={key}>
				<ApplicationForm
					onClose={handleClose}
					stages={stages}
					parsers={parsers}
					initialData={initialData}
				/>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Inner form component - remounts on each modal open via key prop.
 * Zero useEffect - state is fresh on mount, parsed data is derived.
 */
function ApplicationForm({
	onClose,
	stages,
	parsers,
	initialData,
}: {
	onClose: () => void;
	stages: PipelineStage[];
	parsers: ParsingPluginConfig[];
	initialData?: PipelineItem | null;
}) {
	const isEdit = !!initialData;

	// Form state - fresh on each mount
	const [url, setUrl] = useState("");
	const [parserId, setParserId] = useState(
		parsers.length > 0 ? parsers[0].id : "",
	);
	const [company, setCompany] = useState(initialData?.company || "");
	const [position, setPosition] = useState(initialData?.position || "");
	const [stage, setStage] = useState(
		initialData?.stage || (stages.length > 0 ? stages[0].name : ""),
	);
	const [date, setDate] = useState(
		initialData?.date
			? new Date(initialData.date).toISOString().split("T")[0]
			: new Date().toISOString().split("T")[0],
	);
	const [nextAction, setNextAction] = useState(initialData?.nextAction || "");
	const [_urlError, setUrlError] = useState("");

	const parserFetcher = useFetcher<{
		company: string;
		position: string;
		location: string;
		error?: string;
	}>();
	const actionFetcher = useFetcher();

	// Derived state from fetcher (no useEffect!)
	const parsedData = parserFetcher.data;
	const parseError = parsedData?.error;
	const hasParsedData = parsedData && !parseError;

	// Get current parser configuration
	const currentParser = parsers.find((p) => p.id === parserId);
	const _currentExampleUrl = currentParser?.exampleUrl || "";

	// Display values: prefer user input, fallback to parsed data
	const displayCompany = company || (hasParsedData ? parsedData.company : "");
	const displayPosition =
		position || (hasParsedData ? parsedData.position : "");

	// URL validation
	const isUrlValid = url
		? PARSING_PLUGINS.validateUrl(url, parserId as any)
		: true;
	const urlValidationError =
		url && !isUrlValid
			? `URL must be from ${currentParser?.displayName || "the selected site"}`
			: "";

	// Check for successful submission
	const isSubmitSuccess =
		actionFetcher.state === "idle" &&
		actionFetcher.data &&
		!actionFetcher.data.error;

	// Close on success (inline check, triggers handleClose which increments key)
	if (isSubmitSuccess) {
		setTimeout(onClose, 0);
	}

	const handleParse = (forceRefresh = false) => {
		if (!url) return;
		if (!isUrlValid) {
			setUrlError(urlValidationError);
			return;
		}
		setUrlError("");
		parserFetcher.submit(
			{ url, forceRefresh, parserId },
			{
				method: "POST",
				action: "/api/jobs/parse",
				encType: "application/json",
			},
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Both add and edit use the route's action
		actionFetcher.submit(
			{
				intent: isEdit ? "edit" : "add",
				...(isEdit && { itemId: initialData?.id }),
				company: displayCompany,
				position: displayPosition,
				stage,
				date,
				nextAction,
			},
			{ method: "POST", action: "/pipeline" },
		);
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>
					{isEdit ? "Edit Application" : "New Application"}
				</DialogTitle>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 hover:text-gray-500"
				>
					<X className="h-5 w-5" />
				</button>
			</DialogHeader>

			{!isEdit && (
				<>
					{/* Parser Selection */}
					<div className="mb-6">
						<label
							htmlFor="parser"
							className="mb-2 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
						>
							Select Job Site
						</label>
						<select
							id="parser"
							value={parserId}
							onChange={(e) => {
								setParserId(e.target.value);
								setUrl("");
								setUrlError("");
							}}
							className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
						>
							{parsers.map((parser) => (
								<option key={parser.id} value={parser.id}>
									{parser.displayName}
								</option>
							))}
						</select>
						{currentParser && (
							<p className="mt-1.5 text-[10px] text-gray-400">
								{currentParser.description}
							</p>
						)}
					</div>

					{/* Magic Parser Section - Only for new items */}
					<div className="mb-6 w-full border-gray-100 border-t" />

					<div className="mb-6">
						<label
							htmlFor="magicUrl"
							className="mb-2 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
						>
							Magic Paste (URL)
						</label>
						<div className="flex gap-2">
							<input
								id="magicUrl"
								type="url"
								placeholder="Paste your job posting URL here..."
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									setUrlError("");
								}}
								className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 ${urlValidationError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
							/>
							<button
								type="button"
								onClick={() => handleParse(false)}
								disabled={parserFetcher.state !== "idle" || !url}
								className="body-sm flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
							>
								{parserFetcher.state !== "idle" ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								Magic
							</button>
							{/* Refresh button for cache bypass */}
							{hasParsedData && (
								<button
									type="button"
									onClick={() => handleParse(true)}
									disabled={parserFetcher.state !== "idle"}
									className="rounded-lg border border-gray-200 px-3 py-2 font-medium text-gray-600 text-sm transition-all hover:bg-gray-50 disabled:opacity-50"
									title="Refresh data from source"
								>
									<RefreshCw className="h-4 w-4" />
								</button>
							)}
						</div>
						{/* Error display */}
						{parseError && (
							<p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-red-500 text-xs">
								{parseError}
							</p>
						)}
						<p className="mt-1.5 text-[10px] text-gray-400">
							Supports LinkedIn, Indeed, マイナビ転職, リクナビ, Green, Wantedly
						</p>
					</div>
				</>
			)}

			{/* Manual Form */}
			<form onSubmit={handleSubmit} className="stack">
				<div>
					<label
						htmlFor="company"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						Company
					</label>
					<input
						id="company"
						required
						type="text"
						value={displayCompany}
						onChange={(e) => setCompany(e.target.value)}
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				<div>
					<label
						htmlFor="position"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						Position
					</label>
					<input
						id="position"
						required
						type="text"
						value={displayPosition}
						onChange={(e) => setPosition(e.target.value)}
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="stage"
							className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
						>
							Stage
						</label>
						<select
							id="stage"
							value={stage}
							onChange={(e) => setStage(e.target.value)}
							className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
						>
							{stages.map((s) => (
								<option key={s.name} value={s.name}>
									{s.displayName}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor="date"
							className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
						>
							Date
						</label>
						<input
							id="date"
							required
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="nextAction"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						Next Action
					</label>
					<input
						id="nextAction"
						type="text"
						value={nextAction}
						onChange={(e) => setNextAction(e.target.value)}
						placeholder="e.g. Follow up in 3 days"
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				<div className="pt-4">
					<button
						type="submit"
						disabled={
							actionFetcher.state !== "idle" ||
							!displayCompany ||
							!displayPosition
						}
						className="w-full rounded-xl bg-primary-600 py-3 font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50"
					>
						{actionFetcher.state !== "idle"
							? "Submitting..."
							: isEdit
								? "Save Changes"
								: "Add Application"}
					</button>
				</div>
			</form>
		</>
	);
}
