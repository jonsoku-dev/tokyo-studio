import { format } from "date-fns";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import type { DocumentOption } from "~/features/documents/components/DocumentSelector";
import { DocumentSelector } from "~/features/documents/components/DocumentSelector";
import { MAX_SHARED_DOCUMENTS } from "~/features/documents/constants";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import { Textarea } from "~/shared/components/ui/Textarea";
import type { AvailabilitySlot, Mentor } from "../domain/mentoring.types";

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	slot: AvailabilitySlot | null;
	mentor: Mentor;
	/** SPEC 022: User's documents for sharing with mentor */
	userDocuments?: DocumentOption[];
}

/**
 * Booking Modal for mentoring sessions.
 *
 * Design principles:
 * - Zero useEffect (key pattern for reset, derived state for success)
 * - Unidirectional data flow
 */
export function BookingModal({
	isOpen,
	onClose,
	slot,
	mentor,
	userDocuments = [],
}: BookingModalProps) {
	// Key increments on close to reset form state on next open
	const [formKey, setFormKey] = useState(0);

	const handleClose = () => {
		setFormKey((k) => k + 1);
		onClose();
	};

	if (!slot || !mentor.profile) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				{/* Key forces remount = fresh form state */}
				<BookingForm
					key={formKey}
					slot={slot}
					mentor={mentor}
					onClose={handleClose}
					userDocuments={userDocuments}
				/>
			</DialogContent>
		</Dialog>
	);
}

type Step = "duration" | "details" | "payment" | "success";

interface BookingFormProps {
	slot: AvailabilitySlot;
	mentor: Mentor;
	onClose: () => void;
	userDocuments?: DocumentOption[];
}

/**
 * Inner form component - remounts on each modal open via key prop.
 * Zero useEffect - state is fresh on mount, success is derived.
 */
function BookingForm({
	slot,
	mentor,
	onClose,
	userDocuments = [],
}: BookingFormProps) {
	const fetcher = useFetcher();
	const [step, setStep] = useState<Step>("duration");
	const [duration, setDuration] = useState<30 | 60 | 90>(30);
	const [topic, setTopic] = useState("");
	// SPEC 022: Shared documents state
	const [sharedDocumentIds, setSharedDocumentIds] = useState<string[]>([]);

	// Derived state: check for successful submission (no useEffect!)
	const isSuccess =
		fetcher.state === "idle" && fetcher.data?.success && step !== "success";

	// Transition to success step (derived, not useEffect)
	if (isSuccess) {
		setTimeout(() => setStep("success"), 0);
	}

	const hourlyRate = mentor.profile?.hourlyRate || 0;
	const price = hourlyRate * (duration / 60);
	const isSubmitting = fetcher.state !== "idle";

	const handleConfirm = () => {
		fetcher.submit(
			{
				intent: "book",
				mentorId: mentor.id,
				slotId: slot.id,
				duration: String(duration),
				topic,
				price: String(price),
				// SPEC 022: Shared document IDs as comma-separated string
				sharedDocumentIds: sharedDocumentIds.join(","),
			},
			{ method: "post" },
		);
	};

	const renderDurationStep = () => (
		<div className="stack py-4">
			<div className="grid grid-cols-3 gap-3">
				{[30, 60, 90].map((d) => (
					<button
						type="button"
						key={d}
						onClick={() => setDuration(d as 30 | 60 | 90)}
						className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
							duration === d
								? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500"
								: "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-gray-50"
						}`}
					>
						<span className="heading-5 text-gray-900">{d} min</span>
						<span className="caption text-gray-500">
							${((hourlyRate * (d / 60)) / 100).toFixed(0)}
						</span>
					</button>
				))}
			</div>
			<div className="rounded-lg border border-primary-100 bg-primary-50 p-3 text-primary-700 text-sm">
				<p>
					Session with <strong className="font-semibold">{mentor.name}</strong>
				</p>
				<p className="mt-1 text-primary-600 text-xs">
					{format(new Date(slot.startTime), "MMMM d, yyyy 'at' h:mm a")}
				</p>
			</div>
		</div>
	);

	const renderDetailsStep = () => (
		<div className="stack py-4">
			<div className="stack-sm">
				<label
					htmlFor="booking-topic"
					className="font-medium text-gray-700 text-sm"
				>
					What would you like to discuss?
				</label>
				<Textarea
					id="booking-topic"
					placeholder="e.g. Code review for my React project, Career advice..."
					className="min-h-[100px]"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
				/>
				<p className="caption text-right text-gray-400">{topic.length}/500</p>
			</div>

			{/* SPEC 022: Document sharing */}
			{userDocuments.length > 0 && (
				<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
					<DocumentSelector
						documents={userDocuments}
						selectedIds={sharedDocumentIds}
						mode="multi"
						maxSelections={MAX_SHARED_DOCUMENTS}
						onChange={(selected) => setSharedDocumentIds(selected as string[])}
						label="Share Documents (Optional)"
						hint="Share your resume or portfolio for mentor review"
					/>
				</div>
			)}
		</div>
	);

	const renderPaymentStep = () => (
		<div className="stack py-4">
			<div className="rounded-xl border border-gray-200 bg-white p-4">
				<div className="mb-4 flex items-center justify-between border-gray-100 border-b pb-4">
					<span className="text-gray-500">Total</span>
					<span className="heading-3 text-gray-900">
						${(price / 100).toFixed(2)}
					</span>
				</div>

				{/* Mock Card */}
				<div className="stack-sm">
					<div className="relative">
						<CreditCard className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
						<input
							type="text"
							value="4242 4242 4242 4242"
							readOnly
							className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-gray-600 text-sm focus:outline-none"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<input
							type="text"
							value="12/25"
							readOnly
							className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm focus:outline-none"
						/>
						<input
							type="text"
							value="123"
							readOnly
							className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm focus:outline-none"
						/>
					</div>
				</div>
				<p className="mt-3 text-center text-gray-400 text-xs">
					Test Mode: Payment will be simulated.
				</p>
			</div>
		</div>
	);

	const renderSuccessStep = () => (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
				<Check className="h-8 w-8" />
			</div>
			<h3 className="heading-4 text-gray-900">Booking Confirmed!</h3>
			<p className="mt-2 text-gray-500">
				You're all set to meet {mentor.name}.<br />
				Check your email for the calendar invite.
			</p>
		</div>
	);

	const getFooter = () => {
		if (step === "success") {
			return (
				<Button onClick={onClose} className="w-full">
					Done
				</Button>
			);
		}

		return (
			<div className="flex w-full gap-2">
				{step !== "duration" && (
					<Button
						variant="outline"
						onClick={() => setStep(step === "payment" ? "details" : "duration")}
					>
						Back
					</Button>
				)}
				<Button
					className="flex-1"
					disabled={(step === "details" && topic.length < 10) || isSubmitting}
					onClick={() => {
						if (step === "duration") setStep("details");
						else if (step === "details") setStep("payment");
						else if (step === "payment") handleConfirm();
					}}
				>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{step === "payment" ? `Pay $${(price / 100).toFixed(0)}` : "Continue"}
				</Button>
			</div>
		);
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>
					{step === "success" ? "Success" : "Book Session"}
				</DialogTitle>
				<DialogDescription>
					{step === "duration" && "Select session duration"}
					{step === "details" && "Tell us about your goals"}
					{step === "payment" && "Complete payment"}
				</DialogDescription>
			</DialogHeader>

			{step === "duration" && renderDurationStep()}
			{step === "details" && renderDetailsStep()}
			{step === "payment" && renderPaymentStep()}
			{step === "success" && renderSuccessStep()}

			<DialogFooter>{getFooter()}</DialogFooter>
		</>
	);
}
