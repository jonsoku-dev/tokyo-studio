import {
	AtSign,
	Briefcase,
	Building2,
	Instagram,
	Linkedin,
	MessageSquare,
	Pencil,
	Play,
	Star,
	ThumbsUp,
	Twitter,
	Youtube,
} from "lucide-react";
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
import { Button } from "~/shared/components/ui/Button";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BookingModal } from "../components/BookingModal";
import type { AvailabilitySlot } from "../domain/mentoring.types";
import { mentoringService } from "../services/mentoring.server";

// Helper to extract YouTube ID
function getYouTubeId(url: string) {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const mentorId = params.mentorId;
	if (!mentorId) throw new Response("Not Found", { status: 404 });

	const [mentor, availability, userDocuments, communityPosts] =
		await Promise.all([
			mentoringService.getMentorByUserId(mentorId),
			mentoringService.getAvailability(mentorId),
			// SPEC 022: Fetch user's documents for sharing
			documentsService.getUserDocumentsByType(userId, [
				...SHAREABLE_DOCUMENT_TYPES,
			]),
			mentoringService.getMentorCommunityPosts(mentorId),
		]);

	if (!mentor) throw new Response("Not Found", { status: 404 });

	const isOwner = userId === mentorId;

	return { mentor, availability, userDocuments, communityPosts, isOwner };
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
	const { mentor, availability, userDocuments, communityPosts, isOwner } =
		useLoaderData<typeof loader>();
	const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [playingVideo, setPlayingVideo] = useState<string | null>(null);

	const handleSlotSelect = (slot: AvailabilitySlot) => {
		setSelectedSlot(slot);
		setIsModalOpen(true);
	};

	if (!mentor.profile) return null; // Should be handled by loader check

	const social = (mentor.profile.socialHandles as any) || {};
	const videos = (mentor.profile.videoUrls as string[]) || [];

	return (
		<div className="">
			<div className="">
				<div className="grid gap-10 lg:grid-cols-[1fr_360px]">
					{/* Left Column: Profile Info */}
					<div className="stack-lg min-w-0">
						{/* Header Card */}
						<div className="card-lg bg-white p-responsive">
							<div className="flex flex-col items-start gap-4 md:flex-row md:gap-6">
								<img
									src={
										mentor.avatarUrl ||
										`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`
									}
									alt={mentor.name}
									className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
								/>
								<div className="stack-sm flex-1">
									<div className="flex items-center justify-between">
										<h1 className="heading-2 text-gray-900">{mentor.name}</h1>
										{isOwner && (
											<Button variant="outline" size="sm" asChild>
												<a href="/mentoring/settings">
													<Pencil className="mr-2 h-4 w-4" />
													프로필 수정
												</a>
											</Button>
										)}
									</div>
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
											{mentor.profile.yearsOfExperience}년차
										</div>
										<div className="flex items-center gap-1 text-amber-500">
											<Star className="h-4 w-4 fill-current" />
											{((mentor.profile.averageRating || 0) / 100).toFixed(1)}{" "}
											평점
										</div>
									</div>

									{/* Social Icons */}
									<div className="flex gap-3 pt-2">
										{social.linkedin && (
											<a
												href={social.linkedin}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-400 hover:text-[#0077b5]"
											>
												<Linkedin className="h-5 w-5" />
											</a>
										)}
										{social.x && (
											<a
												href={social.x}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-400 hover:text-black"
											>
												<Twitter className="h-5 w-5" />
											</a>
										)}
										{social.instagram && (
											<a
												href={social.instagram}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-400 hover:text-[#E4405F]"
											>
												<Instagram className="h-5 w-5" />
											</a>
										)}
										{social.threads && (
											<a
												href={social.threads}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-400 hover:text-black"
											>
												<AtSign className="h-5 w-5" />
											</a>
										)}
										{social.youtube && (
											<a
												href={social.youtube}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-400 hover:text-[#FF0000]"
											>
												<Youtube className="h-5 w-5" />
											</a>
										)}
									</div>
								</div>

								<div className="hidden text-right md:block">
									<div className="heading-3 text-primary-600">
										{mentor.profile.currency === "USD"
											? "$"
											: mentor.profile.currency === "JPY"
												? "¥"
												: "₩"}
										{(mentor.profile.hourlyRate || 0).toLocaleString()}
									</div>
									<div className="caption text-gray-500">시간당</div>
								</div>
							</div>
						</div>

						{/* Featured Videos */}

						{/* About Section */}
						<div className="stack card-lg bg-white p-responsive">
							<h2 className="heading-4 text-gray-900">멘토 소개 (About)</h2>
							<p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
								{mentor.profile.bio}
							</p>
						</div>

						{/* Expertise */}
						<div className="stack card-lg bg-white p-responsive">
							<h2 className="heading-4 text-gray-900">전문 분야</h2>
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

						{/* Languages */}
						{mentor.profile.languages &&
							mentor.profile.languages.length > 0 && (
								<div className="stack card-lg bg-white p-responsive">
									<h2 className="heading-4 text-gray-900">사용 언어</h2>
									<div className="cluster-sm">
										{mentor.profile.languages.map((lang: string) => (
											<Badge
												key={lang}
												variant="outline"
												className="px-3 py-1 text-gray-600 text-sm"
											>
												{lang}
											</Badge>
										))}
									</div>
								</div>
							)}

						{/* Community Activity (New) */}

						{/* Media & Community Grid */}
						{(videos.length > 0 || communityPosts.length > 0) && (
							<div className="grid grid-cols-1 gap-responsive md:grid-cols-2">
								{/* Featured Videos */}
								{videos.length > 0 && (
									<div className="stack card-lg min-w-0 bg-white p-responsive">
										<h2 className="heading-4 flex items-center gap-2 text-gray-900">
											대표 영상
										</h2>
										<div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
											{videos.map((url, idx) => {
												const videoId = getYouTubeId(url);
												if (!videoId) return null;

												const isPlaying = playingVideo === videoId;

												return (
													<div
														key={`${idx}-${videoId}`}
														className="group w-[240px] min-w-[240px] flex-none snap-start overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
													>
														{isPlaying ? (
															<iframe
																width="100%"
																height="160"
																src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
																title="YouTube video player"
																frameBorder="0"
																allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
																allowFullScreen
																className="aspect-video"
															/>
														) : (
															<button
																type="button"
																onClick={() => setPlayingVideo(videoId)}
																className="relative block aspect-video w-full"
															>
																<img
																	src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
																	alt="Video Thumbnail"
																	className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
																/>
																<div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
																	<div className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
																		<Play className="ml-0.5 h-4 w-4 fill-black text-black" />
																	</div>
																</div>
															</button>
														)}
													</div>
												);
											})}
										</div>
									</div>
								)}

								{/* Community Activity */}
								{communityPosts.length > 0 && (
									<div className="stack card-lg min-w-0 bg-white p-responsive">
										<div className="flex items-center justify-between">
											<h2 className="heading-4 flex items-center gap-2 text-gray-900">
												커뮤니티 활동 (최근)
											</h2>
										</div>
										<div className="stack-sm divide-y divide-gray-100">
											{communityPosts.slice(0, 3).map((post) => (
												<a
													key={post.id}
													href={`/community/${post.id}`}
													className="group -mx-4 block px-4 py-3 transition-colors hover:bg-gray-50"
												>
													<div className="flex items-start justify-between gap-4">
														<div className="stack-xs flex-1">
															<div className="flex items-center gap-2 text-[10px] text-gray-500">
																<span className="rounded-full bg-primary-50 px-1.5 py-0.5 font-medium text-primary-600">
																	{post.category}
																</span>
																<span>
																	{new Date(
																		post.createdAt || new Date(),
																	).toLocaleDateString()}
																</span>
															</div>
															<h3 className="line-clamp-1 font-semibold text-gray-900 text-sm group-hover:text-primary-600">
																{post.title}
															</h3>
														</div>
														<div className="flex shrink-0 items-center gap-2 text-gray-400 text-xs">
															<div className="flex items-center gap-0.5">
																<ThumbsUp className="h-3 w-3" />
																{post.upvotes}
															</div>
															<div className="flex items-center gap-0.5">
																<MessageSquare className="h-3 w-3" />
																{post.commentCount}
															</div>
														</div>
													</div>
												</a>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Reviews */}
						<div className="stack">
							<h2 className="heading-4 text-gray-900">최근 리뷰</h2>
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
													{review.menteeName || "익명"}
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
									<div className="rounded-xl border border-gray-200 border-dashed bg-gray-50 p-responsive text-center">
										<p className="text-gray-500 italic">
											아직 작성된 리뷰가 없습니다.
										</p>
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
								날짜를 선택하여 예약 가능한 시간을 확인하세요.
								<br />
								모든 시간은 한국 시간(KST) 기준입니다.
							</p>

							{/* Google Ads Slot */}
							<div className="mt-6 flex justify-center">
								<div className="flex h-[600px] w-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-center">
									<div className="stack-xs">
										<p className="font-medium text-gray-400 text-sm">
											Advertisement
										</p>
										<p className="text-gray-300 text-xs">
											Google Ads (300x600)
										</p>
									</div>
								</div>
							</div>
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
