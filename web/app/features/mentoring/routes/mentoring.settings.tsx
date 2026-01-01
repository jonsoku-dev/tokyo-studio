import { db } from "@itcom/db/client";
import { mentorProfiles } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
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
			preferredVideoProvider: preferredVideoProvider as any,
			manualMeetingUrl,
			currency,
			hourlyRate,
			updatedAt: new Date(),
		})
		.where(eq(mentorProfiles.userId, userId));

	return { success: true };
}

export default function MentorSettings() {
	const { profile } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const isSaving = navigation.state === "submitting";

	return (
		<div className="">
			<div className="stack-lg">
				<PageHeader
					title="멘토링 설정"
					description="멘토 프로필 정보와 멘토링 세션 환경을 설정합니다."
				/>

				<Form method="post" className="stack-lg">
					{/* 1. Public Profile Section */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-b border-gray-100 px-6 py-4">
							<h2 className="heading-5 text-gray-900">공개 프로필</h2>
							<p className="text-gray-500 text-sm">
								멘티들에게 보여질 기본 정보를 입력해주세요.
							</p>
						</div>
						<div className="p-6 stack-md">
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
						</div>
					</div>

					{/* 2. Session Configuration */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-b border-gray-100 px-6 py-4">
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

					{/* 3. Video Conferencing */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-b border-gray-100 px-6 py-4">
							<h2 className="heading-5 text-gray-900">화상 미팅 설정</h2>
							<p className="text-gray-500 text-sm">
								멘토링 진행 시 사용할 화상 미팅 도구를 선택해주세요.
							</p>
						</div>
						<div className="p-6 stack-md">
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
								<p className="text-xs text-gray-400">
									'직접 입력' 선택 시, 본인의 고정 미팅 링크(Zoom 등)를 입력해야 합니다.
								</p>
							</div>

							<div className="stack-sm">
								<Label htmlFor="manualMeetingUrl">미팅 URL (직접 입력 시)</Label>
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
