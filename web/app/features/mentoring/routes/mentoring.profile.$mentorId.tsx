import { Briefcase, Building2, Star } from "lucide-react";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useLoaderData,
} from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { SHAREABLE_DOCUMENT_TYPES } from "~/features/documents/constants";
import { documentsService } from "~/features/documents/services/documents.server";
import { Badge } from "~/shared/components/ui/Badge";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BookingModal } from "../components/BookingModal";
import type { AvailabilitySlot } from "../domain/mentoring.types";
import { mentoringService } from "../services/mentoring.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const mentorId = params.mentorId;
	if (!mentorId) throw new Response("Not Found", { status: 404 });

	const [mentor, availability, userDocuments] = await Promise.all([
		mentoringService.getMentorByUserId(mentorId),
		mentoringService.getAvailability(mentorId),
		// SPEC 022: Fetch user's documents for sharing
		documentsService.getUserDocumentsByType(userId, [
			...SHAREABLE_DOCUMENT_TYPES,
		]),
	]);

	if (!mentor) throw new Response("Not Found", { status: 404 });

	return { mentor, availability, userDocuments };
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
		// SPEC 022: Parse shared document IDs
		const sharedDocIds = formData.get("sharedDocumentIds") as string;
		const sharedDocumentIds = sharedDocIds
			? sharedDocIds.split(",").filter(Boolean)
			: [];

		try {
			await mentoringService.bookSession(userId, {
				slotId,
				mentorId,
				duration: duration as 30 | 60 | 90,
				topic,
				price,
				sharedDocumentIds,
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
	const { mentor, availability, userDocuments } =
		useLoaderData<typeof loader>();
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
		<div className="">
			<div className="">
				<div className="grid gap-10 lg:grid-cols-[1fr_360px]">
					{/* Left Column: Profile Info */}
					<div className="stack-lg">
						{/* Header Card */}
						<div className="card-lg bg-white p-8">
							<div className="flex flex-col items-start gap-6 md:flex-row">
								<img
									src={
										mentor.avatarUrl ||
										`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`
									}
									alt={mentor.name}
									className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
								/>
								<div className="stack-sm flex-1">
									<h1 className="heading-2 text-gray-900">{mentor.name}</h1>
									<div className="font-medium text-gray-600 text-xl">
										{mentor.profile.jobTitle}
									</div>

									<div className="cluster caption mt-2 text-gray-500">
										<div className="flex items-center gap-1">
											<Building2 className="h-4 w-4" />
											{mentor.profile.company}
										</div>
										<div className="flex items-center gap-1">
											<Briefcase className="h-4 w-4" />
											{mentor.profile.yearsOfExperience} years exp.
										</div>
										<div className="flex items-center gap-1 text-amber-500">
											<Star className="h-4 w-4 fill-current" />
											{((mentor.profile.averageRating || 0) / 100).toFixed(1)}{" "}
											Rating
										</div>
									</div>
								</div>

								<div className="hidden text-right md:block">
									<div className="heading-3 text-primary-600">
										${((mentor.profile.hourlyRate || 0) / 100).toFixed(0)}
									</div>
									<div className="caption text-gray-500">per hour</div>
								</div>
							</div>
						</div>

						{/* About Section */}
						<div className="stack card-lg bg-white p-8">
							<h2 className="heading-4 text-gray-900">About</h2>
							<p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
								{mentor.profile.bio}
							</p>
						</div>

						{/* Expertise */}
						<div className="stack card-lg bg-white p-8">
							<h2 className="heading-4 text-gray-900">Expertise</h2>
							<div className="cluster-sm">
								{mentor.profile.specialties?.map((skill: string) => (
									<Badge
										key={skill}
										variant="secondary"
										className="bg-gray-100 px-3 py-1 text-gray-700 text-sm hover:bg-gray-200"
									>
										{skill}
									</Badge>
								))}
							</div>
						</div>

						{/* Reviews */}
						<div className="stack">
							<h2 className="heading-4 text-gray-900">Recent Reviews</h2>
							<div className="stack">
								{/* Assuming mentor.reviews is augmented in service */}
								{mentor.reviews && mentor.reviews.length > 0 ? (
									mentor.reviews.map((review) => (
										<div
											key={review.id}
											className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
										>
											<div className="mb-2 flex items-center justify-between">
												<div className="font-bold text-gray-900 text-sm">
													{review.menteeName || "Anonymous"}
												</div>
												<div className="flex text-amber-400 text-xs">
													{[...Array(5)].map((_, i) => (
														<Star
															key={`star-${review.id}-${i.toString()}`}
															className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
														/>
													))}
												</div>
											</div>
											<p className="text-gray-600 text-sm">{review.comment}</p>
										</div>
									))
								) : (
									<div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
										<p className="text-gray-500 italic">No reviews yet.</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Calendar */}
					<div className="stack-md">
						<div className="sticky top-24">
							<div className="rounded-2xl border border-primary-100 bg-white p-1 shadow-lg ring-1 ring-black/5">
								<AvailabilityCalendar
									slots={availability}
									onSelectSlot={handleSlotSelect}
									timezone="Asia/Tokyo" // Should detect user timezone
								/>
							</div>
							<p className="caption mt-4 text-center text-gray-500">
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
				userDocuments={userDocuments}
			/>
		</div>
	);
}
