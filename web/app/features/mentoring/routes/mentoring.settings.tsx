import { db } from "@itcom/db/client";
import { mentorProfiles } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import {
	AtSign,
	Instagram,
	Linkedin,
	Plus,
	Trash2,
	Twitter,
	X,
	Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Form,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
} from "react-router";
import { toast } from "sonner";
import { requireUserId } from "~/features/auth/utils/session.server";
import { mentoringService } from "~/features/mentoring/services/mentoring.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Badge } from "~/shared/components/ui/Badge";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { Label } from "~/shared/components/ui/Label";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { Textarea } from "~/shared/components/ui/Textarea";
import type { Route } from "./+types/mentoring.settings";

export function meta() {
	return [{ title: "멘토 설정 - Japan IT Job" }];
}

const VIDEO_PROVIDERS = [
	{ label: "Jitsi Meet (무료/자동생성)", value: "jitsi" },
	{ label: "Google Meet (예정)", value: "google", disabled: true },
	{ label: "Zoom (예정)", value: "zoom", disabled: true },
	{ label: "직접 입력 (Personal Link)", value: "manual" },
];

const CURRENCIES = [
	{ label: "KRW (₩)", value: "KRW" },
	{ label: "JPY (¥)", value: "JPY" },
	{ label: "USD ($)", value: "USD" },
];

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	const profile = await db.query.mentorProfiles.findFirst({
		where: eq(mentorProfiles.userId, userId),
	});

	if (!profile) {
		throw redirect("/mentoring/apply");
	}

	return { profile };
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	// Profile Basic
	const title = String(formData.get("title") || "");
	const company = String(formData.get("company") || "");
	const bio = String(formData.get("bio") || "");
	const yearsOfExperience = Number(formData.get("yearsOfExperience") || 0);

	// Arrays (JSON parsed)
	let specialties: string[] = [];
	let languages: string[] = [];
	let availability: any[] = [];
	let videoUrls: string[] = [];
	let socialHandles: any = {};

	try {
		specialties = JSON.parse(String(formData.get("specialties") || "[]"));
		languages = JSON.parse(String(formData.get("languages") || "[]"));
		availability = JSON.parse(String(formData.get("availability") || "[]"));
		videoUrls = JSON.parse(String(formData.get("videoUrls") || "[]"));
	} catch (e) {
		console.error("Failed to parse array fields", e);
	}

	// Social Handles (Construct Object)
	socialHandles = {
		linkedin: String(formData.get("social_linkedin") || ""),
		x: String(formData.get("social_x") || ""),
		instagram: String(formData.get("social_instagram") || ""),
		threads: String(formData.get("social_threads") || ""),
		youtube: String(formData.get("social_youtube") || ""),
	};

	// Session & Video
	const preferredVideoProvider = String(
		formData.get("preferredVideoProvider") || "jitsi",
	);
	const manualMeetingUrl = String(formData.get("manualMeetingUrl") || "");
	const currency = String(formData.get("currency") || "KRW");
	const hourlyRate = Number(formData.get("hourlyRate") || 0);

	await db
		.update(mentorProfiles)
		.set({
			jobTitle: title,
			company,
			bio,
			yearsOfExperience,
			specialties,
			languages,
			availability,
			videoUrls,
			socialHandles,
			preferredVideoProvider,
			manualMeetingUrl,
			currency,
			hourlyRate,
			updatedAt: new Date(),
		})
		.where(eq(mentorProfiles.userId, userId));

	// Update Availability Slots (Always sync)
	await mentoringService.updateAvailability(userId, availability);

	return { success: true };
}

export default function MentorSettings() {
	const { profile } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSaving = navigation.state === "submitting";

	useEffect(() => {
		if (actionData?.success) {
			toast.success("설정이 저장되었습니다.");
		}
	}, [actionData]);

	// 1. Tag State Logic
	const [specialties, setSpecialties] = useState<string[]>(
		(profile.specialties as string[]) || [],
	);
	const [languages, setLanguages] = useState<string[]>(
		(profile.languages as string[]) || [],
	);
	const [tagInput, setTagInput] = useState("");
	const [langInput, setLangInput] = useState("");

	const handleAddTag = (
		e: React.KeyboardEvent<HTMLInputElement>,
		type: "specialties" | "languages",
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const val = type === "specialties" ? tagInput.trim() : langInput.trim();
			if (!val) return;

			if (type === "specialties") {
				if (!specialties.includes(val)) {
					setSpecialties([...specialties, val]);
				}
				setTagInput("");
			} else {
				if (!languages.includes(val)) {
					setLanguages([...languages, val]);
				}
				setLangInput("");
			}
		}
	};

	const handleRemoveTag = (tag: string, type: "specialties" | "languages") => {
		if (type === "specialties") {
			setSpecialties(specialties.filter((t) => t !== tag));
		} else {
			setLanguages(languages.filter((t) => t !== tag));
		}
	};

	// 2. Video URL State
	const [videoUrls, setVideoUrls] = useState<string[]>(
		(profile.videoUrls as string[]) || [],
	);

	const handleAddVideoUrl = () => {
		setVideoUrls([...videoUrls, ""]);
	};

	const handleUpdateVideoUrl = (index: number, value: string) => {
		const newUrls = [...videoUrls];
		newUrls[index] = value;
		setVideoUrls(newUrls);
	};

	const handleRemoveVideoUrl = (index: number) => {
		setVideoUrls(videoUrls.filter((_, i) => i !== index));
	};

	return (
		<div className="mx-auto max-w-3xl pb-20">
			<div className="stack-lg">
				<PageHeader
					title="멘토링 설정"
					description="멘토 프로필 정보와 멘토링 세션 환경을 설정합니다."
				/>

				<Form method="post" className="stack-lg">
					{/* Hidden Inputs for Arrays */}
					<input
						type="hidden"
						name="specialties"
						value={JSON.stringify(specialties)}
					/>
					<input
						type="hidden"
						name="languages"
						value={JSON.stringify(languages)}
					/>

					{/* 1. Public Profile Section */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-gray-100 border-b px-6 py-4">
							<h2 className="heading-5 text-gray-900">공개 프로필</h2>
							<p className="text-gray-500 text-sm">
								멘티들에게 보여질 기본 정보를 입력해주세요.
							</p>
						</div>
						<div className="stack-md p-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="stack-sm">
									<Label htmlFor="title">직함 (Title)</Label>
									<Input
										name="title"
										id="title"
										defaultValue={profile.jobTitle || ""}
										placeholder="예: Senior Frontend Engineer"
									/>
								</div>
								<div className="stack-sm">
									<Label htmlFor="company">현재 직장</Label>
									<Input
										name="company"
										id="company"
										defaultValue={profile.company || ""}
										placeholder="예: Line Yahoo"
									/>
								</div>
							</div>

							<div className="stack-sm">
								<Label htmlFor="bio">자기소개</Label>
								<Textarea
									name="bio"
									id="bio"
									defaultValue={profile.bio || ""}
									placeholder="자신의 경력과 멘토링 스타일을 소개해주세요."
									className="min-h-[120px]"
								/>
							</div>

							<div className="stack-sm">
								<Label htmlFor="yearsOfExperience">경력 (년차)</Label>
								<Input
									type="number"
									name="yearsOfExperience"
									id="yearsOfExperience"
									defaultValue={profile.yearsOfExperience || 0}
									min={0}
									className="max-w-[120px]"
								/>
							</div>

							{/* Specialties (Tags) */}
							<div className="stack-sm">
								<Label>전문 분야 (Tags)</Label>
								<div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-white p-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
									{specialties.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="flex items-center gap-1 pr-1"
										>
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag, "specialties")}
												className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
									<input
										type="text"
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyDown={(e) => handleAddTag(e, "specialties")}
										placeholder={
											specialties.length === 0
												? "예: React, System Design (엔터로 추가)"
												: ""
										}
										className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
									/>
								</div>
								<p className="text-gray-400 text-xs">
									엔터(Enter) 키르 눌러 태그를 추가하세요.
								</p>
							</div>

							{/* Languages (Tags) */}
							<div className="stack-sm">
								<Label>사용 가능 언어</Label>
								<div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-white p-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
									{languages.map((lang) => (
										<Badge
											key={lang}
											variant="outline"
											className="flex items-center gap-1 pr-1"
										>
											{lang}
											<button
												type="button"
												onClick={() => handleRemoveTag(lang, "languages")}
												className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
									<input
										type="text"
										value={langInput}
										onChange={(e) => setLangInput(e.target.value)}
										onKeyDown={(e) => handleAddTag(e, "languages")}
										placeholder={
											languages.length === 0
												? "예: 한국어, 일본어, 영어 (엔터로 추가)"
												: ""
										}
										className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* 2. Social Media & Content */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-gray-100 border-b px-6 py-4">
							<h2 className="heading-5 text-gray-900">소셜 미디어 & 콘텐츠</h2>
							<p className="text-gray-500 text-sm">
								외부 활동을 공유하여 멘티들에게 신뢰를 줄 수 있습니다.
							</p>
						</div>
						<div className="stack-md p-6">
							{/* Social Handles */}
							<div className="stack-sm">
								<Label>소셜 미디어 링크</Label>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Input
										name="social_linkedin"
										defaultValue={profile.socialHandles?.linkedin || ""}
										placeholder="LinkedIn URL"
										startIcon={<Linkedin className="h-4 w-4 text-gray-400" />}
									/>
									<Input
										name="social_x"
										defaultValue={profile.socialHandles?.x || ""}
										placeholder="X (Twitter) URL"
										startIcon={<Twitter className="h-4 w-4 text-gray-400" />}
									/>
									<Input
										name="social_instagram"
										defaultValue={profile.socialHandles?.instagram || ""}
										placeholder="Instagram URL"
										startIcon={<Instagram className="h-4 w-4 text-gray-400" />}
									/>
									<Input
										name="social_threads"
										defaultValue={profile.socialHandles?.threads || ""}
										placeholder="Threads URL"
										startIcon={<AtSign className="h-4 w-4 text-gray-400" />}
									/>
									<Input
										name="social_youtube"
										defaultValue={profile.socialHandles?.youtube || ""}
										placeholder="YouTube Channel URL"
										startIcon={<Youtube className="h-4 w-4 text-gray-400" />}
									/>
								</div>
							</div>

							{/* Featured Videos */}
							<div className="stack-sm border-gray-100 border-t pt-4">
								<Label>대표 영상 (YouTube)</Label>
								<div className="stack-sm">
									{videoUrls.map((url, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<div className="relative flex-1">
												<Input
													value={url}
													onChange={(e) =>
														handleUpdateVideoUrl(idx, e.target.value)
													}
													placeholder="https://www.youtube.com/watch?v=..."
													startIcon={
														<Youtube className="h-4 w-4 text-gray-400" />
													}
												/>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveVideoUrl(idx)}
												className="text-gray-400 hover:text-red-500"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleAddVideoUrl}
										className="self-start"
									>
										<Plus className="mr-2 h-4 w-4" />
										영상 추가하기
									</Button>
									<input
										type="hidden"
										name="videoUrls"
										value={JSON.stringify(videoUrls.filter((u) => u.trim()))}
									/>
								</div>
								<p className="text-gray-400 text-xs">
									멘토링 소개 영상이나, 본인이 출연한 기술/커리어 관련 영상을
									등록하세요.
								</p>
							</div>
						</div>
					</div>

					{/* 3. Session Configuration */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-gray-100 border-b px-6 py-4">
							<h2 className="heading-5 text-gray-900">세션 설정</h2>
							<p className="text-gray-500 text-sm">
								시간당 비용과 결제 통화를 설정합니다.
							</p>
						</div>
						<div className="p-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="stack-sm">
									<Label>통화 (Currency)</Label>
									<Select
										name="currency"
										defaultValue={profile.currency || "KRW"}
										options={CURRENCIES}
									>
										<SelectTrigger>
											<SelectValue placeholder="통화 선택" />
										</SelectTrigger>
										<SelectContent />
									</Select>
								</div>
								<div className="stack-sm">
									<Label>시간당 비용 (Rate)</Label>
									<Input
										type="number"
										name="hourlyRate"
										defaultValue={profile.hourlyRate || 0}
										min={0}
										placeholder="0"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* 4. Availability (Weekly Schedule) */}
					<AvailabilityEditor
						initialSlots={(profile.availability as unknown as any[]) || []}
					/>

					{/* 5. Video Conferencing */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-gray-100 border-b px-6 py-4">
							<h2 className="heading-5 text-gray-900">화상 미팅 설정</h2>
							<p className="text-gray-500 text-sm">
								멘토링 진행 시 사용할 화상 미팅 도구를 선택해주세요.
							</p>
						</div>
						<div className="stack-md p-6">
							<div className="stack-sm">
								<Label>플랫폼 선택</Label>
								<Select
									name="preferredVideoProvider"
									defaultValue={profile.preferredVideoProvider || "jitsi"}
									options={VIDEO_PROVIDERS}
								>
									<SelectTrigger>
										<SelectValue placeholder="플랫폼 선택" />
									</SelectTrigger>
									<SelectContent />
								</Select>
								<p className="text-gray-400 text-xs">
									'직접 입력' 선택 시, 본인의 고정 미팅 링크(Zoom 등)를 입력해야
									합니다.
								</p>
							</div>

							<div className="stack-sm">
								<Label htmlFor="manualMeetingUrl">
									미팅 URL (직접 입력 시)
								</Label>
								<Input
									name="manualMeetingUrl"
									id="manualMeetingUrl"
									defaultValue={profile.manualMeetingUrl || ""}
									placeholder="https://zoom.us/j/12345678"
								/>
							</div>
						</div>
					</div>

					<div className="flex justify-end pt-4 pb-20">
						<Button type="submit" size="lg" disabled={isSaving}>
							{isSaving ? "저장 중..." : "설정 저장하기"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}

// --- Availability Editor Component ---

const DAYS = [
	{ value: "1", label: "월요일" },
	{ value: "2", label: "화요일" },
	{ value: "3", label: "수요일" },
	{ value: "4", label: "목요일" },
	{ value: "5", label: "금요일" },
	{ value: "6", label: "토요일" },
	{ value: "0", label: "일요일" },
];

const TIMES = Array.from({ length: 24 * 2 }).map((_, i) => {
	const hour = Math.floor(i / 2);
	const minute = i % 2 === 0 ? "00" : "30";
	const time = `${hour.toString().padStart(2, "0")}:${minute}`;
	return { value: time, label: time };
});

function AvailabilityEditor({
	initialSlots,
}: {
	initialSlots: { day: string; start: string; end: string }[];
}) {
	const [slots, setSlots] = useState<
		{ day: string; start: string; end: string }[]
	>(initialSlots || []);
	const [day, setDay] = useState("1");
	const [start, setStart] = useState("09:00");
	const [end, setEnd] = useState("18:00");

	const handleAdd = () => {
		// Basic validation
		if (start >= end) {
			toast.error("종료 시간은 시작 시간보다 늦어야 합니다.");
			return;
		}
		// Overlap check (optional but recommended)
		const isOverlap = slots.some(
			(s) =>
				s.day === day &&
				((start >= s.start && start < s.end) ||
					(end > s.start && end <= s.end)),
		);
		if (isOverlap) {
			toast.error("겹치는 시간대입니다.");
			return;
		}

		setSlots([...slots, { day, start, end }]);
	};

	const handleRemove = (index: number) => {
		setSlots(slots.filter((_, i) => i !== index));
	};

	return (
		<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
			<input type="hidden" name="availability" value={JSON.stringify(slots)} />
			<div className="border-gray-100 border-b px-6 py-4">
				<h2 className="heading-5 text-gray-900">가능 시간 설정</h2>
				<p className="text-gray-500 text-sm">
					멘토링이 가능한 요일과 시간을 설정합니다. (반복 일정)
				</p>
			</div>
			<div className="stack-md p-6">
				{/* 1. Add Form */}
				<div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 md:flex-row md:items-end">
					<div className="stack-xs flex-1">
						<Label>요일</Label>
						<Select value={day} onValueChange={setDay} options={DAYS}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent />
						</Select>
					</div>
					<div className="stack-xs flex-1">
						<Label>시작 시간</Label>
						<Select value={start} onValueChange={setStart} options={TIMES}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="max-h-[200px]" />
						</Select>
					</div>
					<div className="stack-xs flex-1">
						<Label>종료 시간</Label>
						<Select value={end} onValueChange={setEnd} options={TIMES}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="max-h-[200px]" />
						</Select>
					</div>
					<Button type="button" variant="secondary" onClick={handleAdd}>
						추가
					</Button>
				</div>

				{/* 2. List */}
				<div className="stack-sm">
					<Label>설정된 시간 ({slots.length})</Label>
					{slots.length === 0 ? (
						<div className="rounded-lg border border-gray-200 border-dashed p-8 text-center text-gray-400 text-sm">
							등록된 시간이 없습니다. 위에서 시간을 추가해주세요.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{slots
								.sort((a, b) => {
									// Sort by day then time
									const da = Number(a.day) === 0 ? 7 : Number(a.day);
									const db = Number(b.day) === 0 ? 7 : Number(b.day);
									if (da !== db) return da - db;
									return a.start.localeCompare(b.start);
								})
								.map((slot, idx) => (
									<div
										key={`${slot.day}-${slot.start}-${slot.end}`} // Safe key
										className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm"
									>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="w-16 justify-center">
												{DAYS.find((d) => d.value === slot.day)?.label}
											</Badge>
											<span className="font-medium text-gray-700 text-sm">
												{slot.start} ~ {slot.end}
											</span>
										</div>
										<button
											type="button"
											onClick={() => handleRemove(idx)} // Using index for removal for simplicity in local state
											className="text-gray-400 hover:text-red-500"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
