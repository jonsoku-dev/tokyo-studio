import { format } from "date-fns";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

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
}

type Step = "duration" | "details" | "payment" | "success";

export function BookingModal({
	isOpen,
	onClose,
	slot,
	mentor,
}: BookingModalProps) {
	const fetcher = useFetcher();
	const [step, setStep] = useState<Step>("duration");
	const [duration, setDuration] = useState<30 | 60 | 90>(30); // Default 30? Spec says 30min increments.
	// Spec FR-009: 30/60/90.
	const [topic, setTopic] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Reset on open
	useEffect(() => {
		if (isOpen) {
			setStep("duration");
			setTopic("");
			setIsSubmitting(false);
		}
	}, [isOpen]);

	// Handle fetcher response
	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.success) {
			setStep("success");
		}
	}, [fetcher.state, fetcher.data]);

	if (!slot || !mentor.profile) return null;

	const hourlyRate = mentor.profile.hourlyRate || 0; // cents
	const price = hourlyRate * (duration / 60); // Simple linear pricing

	const handleConfirm = () => {
		setIsSubmitting(true);
		fetcher.submit(
			{
				intent: "book",
				mentorId: mentor.id,
				slotId: slot.id, // We need slot ID
				duration: String(duration),
				topic,
				price: String(price),
			},
			{ method: "post" },
		);
	};

	const renderDurationStep = () => (
		<div className="space-y-4 py-4">
			<div className="grid grid-cols-3 gap-3">
				{[30, 60, 90].map((d) => (
					<button
						type="button"
						key={d}
						onClick={() => setDuration(d as 30 | 60 | 90)}
						className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
							duration === d
								? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
								: "border-white/10 bg-white/5 hover:border-white/20"
						}`}
					>
						<span className="text-lg font-bold">{d} min</span>
						<span className="text-xs text-gray-400">
							${((hourlyRate * (d / 60)) / 100).toFixed(0)}
						</span>
					</button>
				))}
			</div>
			<div className="rounded-lg bg-blue-900/20 p-3 text-sm text-blue-200">
				<p>
					Session with <strong>{mentor.name}</strong>
				</p>
				<p className="text-xs opacity-70">
					{format(new Date(slot.startTime), "MMMM d, yyyy 'at' h:mm a")}
				</p>
			</div>
		</div>
	);

	const renderDetailsStep = () => (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<label
					htmlFor="booking-topic"
					className="text-sm font-medium text-gray-300"
				>
					What would you like to discuss?
				</label>
				<Textarea
					id="booking-topic"
					placeholder="e.g. Code review for my React project, Career advice..."
					className="min-h-[100px] bg-white/5 border-white/10"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
				/>
				<p className="text-xs text-gray-500 text-right">{topic.length}/500</p>
			</div>
		</div>
	);

	const renderPaymentStep = () => (
		<div className="space-y-4 py-4">
			<div className="rounded-xl border border-white/10 bg-white/5 p-4">
				<div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
					<span className="text-gray-400">Total</span>
					<span className="text-2xl font-bold">
						${(price / 100).toFixed(2)}
					</span>
				</div>

				{/* Mock Card */}
				<div className="space-y-3">
					<div className="relative">
						<CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
						<input
							type="text"
							value="4242 4242 4242 4242"
							readOnly
							className="w-full rounded-md border border-white/10 bg-black/50 py-2 pl-9 pr-3 text-sm text-gray-400"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<input
							type="text"
							value="12/25"
							readOnly
							className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-gray-400"
						/>
						<input
							type="text"
							value="123"
							readOnly
							className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-gray-400"
						/>
					</div>
				</div>
				<p className="mt-3 text-xs text-center text-gray-500">
					Test Mode: Payment will be simulated.
				</p>
			</div>
		</div>
	);

	const renderSuccessStep = () => (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
				<Check className="h-8 w-8" />
			</div>
			<h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
			<p className="mt-2 text-gray-400">
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
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="border-white/10 bg-black/90 text-white backdrop-blur-xl sm:max-w-[425px]">
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
			</DialogContent>
		</Dialog>
	);
}
