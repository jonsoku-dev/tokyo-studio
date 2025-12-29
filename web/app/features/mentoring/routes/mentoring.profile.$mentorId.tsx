import { Briefcase, Building2, Star } from "lucide-react";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useLoaderData,
} from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Badge } from "~/shared/components/ui/Badge";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BookingModal } from "../components/BookingModal";
import type { AvailabilitySlot } from "../domain/mentoring.types";
import { mentoringService } from "../services/mentoring.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const mentorId = params.mentorId;
	if (!mentorId) throw new Response("Not Found", { status: 404 });

	const mentor = await mentoringService.getMentorByUserId(mentorId);
	if (!mentor) throw new Response("Not Found", { status: 404 });

	const availability = await mentoringService.getAvailability(mentorId);

	return { mentor, availability };
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "book") {
		const slotId = formData.get("slotId") as string;
		const mentorId = formData.get("mentorId") as string;
		const duration = Number(formData.get("duration"));
		const topic = formData.get("topic") as string;
		const price = Number(formData.get("price"));

		try {
			await mentoringService.bookSession(userId, {
				slotId,
				mentorId,
				duration: duration as 30 | 60 | 90,
				topic,
				price,
			});
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, error: "Booking failed" };
		}
	}

	return null;
}

export default function MentorProfilePage() {
	const { mentor, availability } = useLoaderData<typeof loader>();
	const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSlotSelect = (slot: AvailabilitySlot) => {
		setSelectedSlot(slot);
		setIsModalOpen(true);
	};

	if (!mentor.profile) return null; // Should be handled by loader check

	return (
		<div className="min-h-screen bg-black text-white pt-24 pb-12">
			{/* Background elements */}
			<div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />

			<div className="container mx-auto px-4 relative z-10">
				<div className="grid gap-10 lg:grid-cols-[1fr_360px]">
					{/* Left Column: Profile Info */}
					<div className="space-y-8">
						{/* Header Card */}
						<div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
							<div className="flex flex-col md:flex-row gap-6 items-start">
								<img
									src={
										mentor.avatarUrl ||
										`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`
									}
									alt={mentor.name}
									className="h-32 w-32 rounded-full border-4 border-white/10 object-cover shadow-2xl"
								/>
								<div className="flex-1 space-y-2">
									<h1 className="text-3xl font-bold">{mentor.name}</h1>
									<div className="text-xl text-gray-400 font-medium">
										{mentor.profile.jobTitle}
									</div>

									<div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
										<div className="flex items-center gap-1">
											<Building2 className="h-4 w-4" />
											{mentor.profile.company}
										</div>
										<div className="flex items-center gap-1">
											<Briefcase className="h-4 w-4" />
											{mentor.profile.yearsOfExperience} years exp.
										</div>
										<div className="flex items-center gap-1 text-amber-400">
											<Star className="h-4 w-4 fill-current" />
											{((mentor.profile.averageRating || 0) / 100).toFixed(1)}{" "}
											Rating
										</div>
									</div>
								</div>

								<div className="text-right hidden md:block">
									<div className="text-2xl font-bold">
										${((mentor.profile.hourlyRate || 0) / 100).toFixed(0)}
									</div>
									<div className="text-sm text-gray-500">per hour</div>
								</div>
							</div>
						</div>

						{/* About Section */}
						<div className="space-y-4">
							<h2 className="text-xl font-bold">About</h2>
							<p className="text-gray-300 leading-relaxed whitespace-pre-wrap px-4">
								{mentor.profile.bio}
							</p>
						</div>

						{/* Expertise */}
						<div className="space-y-4">
							<h2 className="text-xl font-bold">Expertise</h2>
							<div className="flex flex-wrap gap-2 px-4">
								{mentor.profile.specialties?.map((skill: string) => (
									<Badge
										key={skill}
										variant="secondary"
										className="bg-white/10 text-sm py-1 px-3"
									>
										{skill}
									</Badge>
								))}
							</div>
						</div>

						{/* Reviews */}
						<div className="space-y-4">
							<h2 className="text-xl font-bold">Recent Reviews</h2>
							<div className="space-y-4">
								{/* Assuming mentor.reviews is augmented in service */}
								{mentor.reviews && mentor.reviews.length > 0 ? (
									mentor.reviews.map((review) => (
										<div
											key={review.id}
											className="rounded-xl border border-white/5 bg-white/5 p-4"
										>
											<div className="flex items-center justify-between mb-2">
												<div className="font-bold text-sm">
													{review.menteeName || "Anonymous"}
												</div>
												<div className="flex text-amber-400 text-xs">
													{[...Array(5)].map((_, i) => (
														<Star
															key={`star-${review.id}-${i.toString()}`}
															className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-gray-700"}`}
														/>
													))}
												</div>
											</div>
											<p className="text-sm text-gray-400">{review.comment}</p>
										</div>
									))
								) : (
									<p className="text-gray-500 italic px-4">No reviews yet.</p>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Calendar */}
					<div className="space-y-6">
						<div className="sticky top-24">
							<div className="rounded-2xl border border-gradient p-[1px] bg-gradient-to-br from-primary/50 to-purple-600/50">
								<div className="rounded-2xl bg-black p-1">
									<AvailabilityCalendar
										slots={availability}
										onSelectSlot={handleSlotSelect}
										timezone="Asia/Tokyo" // Should detect user timezone
									/>
								</div>
							</div>
							<p className="text-center text-xs text-gray-500 mt-4">
								Select a date to view available times.
								<br />
								All times are in your local timezone.
							</p>
						</div>
					</div>
				</div>
			</div>

			<BookingModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				slot={selectedSlot}
				mentor={mentor}
			/>
		</div>
	);
}
