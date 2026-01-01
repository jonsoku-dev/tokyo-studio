import { Dialog, Transition } from "@headlessui/react";
import { Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { Fragment, useState } from "react";
import { useFetcher } from "react-router";

interface AddApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Modal for adding a new job application.
 *
 * Design principles:
 * - Zero useEffect (pure derivation)
 * - Derived state from fetcher.data
 * - Form reset via key prop pattern (remount = fresh state)
 */
export function AddApplicationModal({
	isOpen,
	onClose,
}: AddApplicationModalProps) {
	// Key increments on close to reset form state on next open
	const [formKey, setFormKey] = useState(0);

	const handleClose = () => {
		setFormKey((k) => k + 1);
		onClose();
	};

	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={handleClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							{/* key forces remount = fresh form state */}
							<ApplicationForm key={formKey} onClose={handleClose} />
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

/**
 * Inner form component - remounts on each modal open via key prop.
 * Zero useEffect - state is fresh on mount, parsed data is derived.
 */
function ApplicationForm({ onClose }: { onClose: () => void }) {
	// Form state - fresh on each mount
	const [url, setUrl] = useState("");
	const [company, setCompany] = useState("");
	const [position, setPosition] = useState("");
	const [stage, setStage] = useState("applied");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [nextAction, setNextAction] = useState("");

	const parserFetcher = useFetcher<{
		company: string;
		position: string;
		location: string;
		error?: string;
	}>();
	const addFetcher = useFetcher();

	// Derived state from fetcher (no useEffect!)
	const parsedData = parserFetcher.data;
	const parseError = parsedData?.error;
	const hasParsedData = parsedData && !parseError;

	// Display values: prefer user input, fallback to parsed data
	const displayCompany = company || (hasParsedData ? parsedData.company : "");
	const displayPosition =
		position || (hasParsedData ? parsedData.position : "");

	// Check for successful submission
	const isSubmitSuccess =
		addFetcher.state === "idle" && addFetcher.data && !addFetcher.data.error;

	// Close on success (inline check, triggers handleClose which increments key)
	if (isSubmitSuccess) {
		setTimeout(onClose, 0);
	}

	const handleParse = (forceRefresh = false) => {
		if (!url) return;
		parserFetcher.submit(
			{ url, forceRefresh },
			{
				method: "POST",
				action: "/api/jobs/parse",
				encType: "application/json",
			},
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		addFetcher.submit(
			{
				intent: "add",
				company: displayCompany,
				position: displayPosition,
				stage,
				date,
				nextAction,
			},
			{ method: "POST" },
		);
	};

	return (
		<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
			<div className="mb-4 flex items-center justify-between">
				<Dialog.Title as="h3" className="heading-5 leading-6">
					New Application
				</Dialog.Title>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 hover:text-gray-500"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			{/* Magic Parser Section */}
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
						placeholder="https://linkedin.com/jobs/..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500"
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

			<div className="mb-6 w-full border-gray-100 border-t" />

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
							<option value="applied">Applied</option>
							<option value="interview">Interview</option>
							<option value="offer">Offer</option>
							<option value="rejected">Rejected</option>
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
							addFetcher.state !== "idle" || !displayCompany || !displayPosition
						}
						className="w-full rounded-xl bg-primary-600 py-3 font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50"
					>
						{addFetcher.state !== "idle" ? "Submitting..." : "Add Application"}
					</button>
				</div>
			</form>
		</Dialog.Panel>
	);
}
