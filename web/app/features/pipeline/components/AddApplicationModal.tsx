import { Dialog, Transition } from "@headlessui/react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useFetcher } from "react-router";

interface AddApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddApplicationModal({
	isOpen,
	onClose,
}: AddApplicationModalProps) {
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
	const [parseSuccess, setParseSuccess] = useState(false);

	// Handle Parse Result
	useEffect(() => {
		if (parserFetcher.data && !parserFetcher.data.error) {
			setCompany(parserFetcher.data.company || "");
			setPosition(parserFetcher.data.position || "");
			setParseSuccess(true);
		}
	}, [parserFetcher.data]);

	// Handle Close upon successful Add
	useEffect(() => {
		if (addFetcher.state === "submitting") {
			// Optionally show loading on submit button
		}
		if (
			addFetcher.state === "idle" &&
			addFetcher.data &&
			!addFetcher.data.error
		) {
			onClose();
			// Reset form
			setUrl("");
			setCompany("");
			setPosition("");
			setNextAction("");
		}
	}, [addFetcher.state, addFetcher.data, onClose]);

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
				company,
				position,
				stage,
				date,
				nextAction,
			},
			{ method: "POST" },
		);
	};

	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
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
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<div className="flex items-center justify-between mb-4">
									<Dialog.Title
										as="h3"
										className="text-lg font-bold text-gray-900 leading-6"
									>
										New Application
									</Dialog.Title>
									<button
										type="button"
										onClick={onClose}
										className="text-gray-400 hover:text-gray-500"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								{/* Magic Parser Section */}
								<div className="mb-6">
									<label
										htmlFor="magicUrl"
										className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
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
											className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
										/>
										<button
											type="button"
											onClick={() => handleParse(false)}
											disabled={parserFetcher.state !== "idle" || !url}
											className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
										>
											{parserFetcher.state !== "idle" ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Sparkles className="w-4 h-4" />
											)}
											Magic
										</button>
										{/* User Story 2: Refresh button for cache bypass */}
										{parseSuccess && (
											<button
												type="button"
												onClick={() => handleParse(true)}
												disabled={parserFetcher.state !== "idle"}
												className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
												title="Refresh data from source"
											>
												↻
											</button>
										)}
									</div>
									{/* FR-008: Error display */}
									{parserFetcher.data?.error && (
										<p className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
											{parserFetcher.data.error}
										</p>
									)}
									<p className="mt-1.5 text-[10px] text-gray-400">
										Supports LinkedIn, Indeed, マイナビ転職, リクナビ, Green,
										Wantedly
									</p>
								</div>

								<div className="w-full border-t border-gray-100 mb-6" />

								{/* Manual Form */}
								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<label
											htmlFor="company"
											className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
										>
											Company
										</label>
										<input
											id="company"
											required
											type="text"
											value={company}
											onChange={(e) => setCompany(e.target.value)}
											className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
										/>
									</div>

									<div>
										<label
											htmlFor="position"
											className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
										>
											Position
										</label>
										<input
											id="position"
											required
											type="text"
											value={position}
											onChange={(e) => setPosition(e.target.value)}
											className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="stage"
												className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
											>
												Stage
											</label>
											<select
												id="stage"
												value={stage}
												onChange={(e) => setStage(e.target.value)}
												className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
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
												className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
											>
												Date
											</label>
											<input
												id="date"
												required
												type="date"
												value={date}
												onChange={(e) => setDate(e.target.value)}
												className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor="nextAction"
											className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
										>
											Next Action
										</label>
										<input
											id="nextAction"
											type="text"
											value={nextAction}
											onChange={(e) => setNextAction(e.target.value)}
											placeholder="e.g. Follow up in 3 days"
											className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
										/>
									</div>

									<div className="pt-4">
										<button
											type="submit"
											disabled={
												addFetcher.state !== "idle" || !company || !position
											}
											className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
										>
											{addFetcher.state !== "idle"
												? "Submitting..."
												: "Add Application"}
										</button>
									</div>
								</form>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
