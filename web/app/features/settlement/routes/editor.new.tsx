import { db } from "@itcom/db/client";
import { settlementTemplates } from "@itcom/db/schema";
import { redirect, useFetcher, useNavigation } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { Label } from "~/shared/components/ui/Label";
import { Textarea } from "~/shared/components/ui/Textarea";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { requireUserId } from "../../auth/utils/session.server";
import type { Route } from "./+types/editor.new";

const VISA_OPTIONS = [
	{ label: "기술/인문지식/국제업무", value: "Engineer" },
	{ label: "유학", value: "Student" },
	{ label: "워킹홀리데이", value: "Working Holiday" },
	{ label: "가족체재", value: "Dependent" },
	{ label: "고도인재", value: "HSP" },
	{ label: "일본인의 배우자", value: "Spouse" },
	{ label: "기타", value: "Other" },
];

const FAMILY_OPTIONS = [
	{ label: "1인 (싱글)", value: "Single" },
	{ label: "2인 (부부/커플)", value: "Couple" },
	{ label: "자녀 동반", value: "Family with Kids" },
	{ label: "반려동물 동반", value: "Pet Owner" },
];

const REGION_OPTIONS = [
	{ label: "도쿄 (Tokyo)", value: "Tokyo" },
	{ label: "오사카 (Osaka)", value: "Osaka" },
	{ label: "후쿠오카 (Fukuoka)", value: "Fukuoka" },
	{ label: "나고야 (Nagoya)", value: "Nagoya" },
	{ label: "기타/원격", value: "Remote" },
];

export function meta() {
	return [{ title: "Create Settlement Template" }];
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const title = String(formData.get("title"));
	const description = String(formData.get("description"));

	// New Filters
	const targetVisa = String(formData.get("targetVisa") || "");
	const familyStatus = String(formData.get("familyStatus") || "");
	const region = String(formData.get("region") || "Tokyo");

	if (!title) {
		return { error: "Title is required" };
	}

	const [template] = await db
		.insert(settlementTemplates)
		.values({
			authorId: userId,
			title,
			description,
			status: "draft",
			isOfficial: false,
			targetVisa: targetVisa || null,
			familyStatus: familyStatus || null,
			region,
		})
		.returning();

	return redirect(`/settlement/editor/${template.id}`);
}

export default function CreateTemplate() {
	const fetcher = useFetcher();
    // Fetcher doesn't expose 'navigation' state directly like useNavigation, but it has .state
    // However, for page transitions on action redirect, regular navigation might be better if not using fetcher.Form?
    // User used fetcher.Form previously. Let's stick to it, but handle loading state.
    const isSubmitting = fetcher.state === "submitting" || fetcher.state === "loading";

	return (
		<div className="mx-auto max-w-3xl">
			<div className="stack-lg">
				<PageHeader
					title="새로운 체크리스트 만들기"
					description="당신의 정착 경험과 노하우를 공유하여 다른 사람들에게 도움을 주세요."
				/>

				<fetcher.Form method="post" className="stack-lg">
					{/* Section 1: Basic Information */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-b border-gray-100 px-6 py-4">
							<h2 className="heading-5 text-gray-900">기본 정보</h2>
							<p className="text-gray-500 text-sm">
								체크리스트의 제목과 설명을 입력해주세요.
							</p>
						</div>
						<div className="p-6 stack-md">
							<div className="stack-sm">
								<Label htmlFor="title">제목</Label>
								<Input
									name="title"
									id="title"
									placeholder="예: 워킹홀리데이 100일 완성 가이드"
									required
                                    className="text-lg font-medium"
								/>
							</div>

							<div className="stack-sm">
								<Label htmlFor="description">설명</Label>
								<Textarea
									name="description"
									id="description"
									placeholder="이 체크리스트는 누구에게 도움이 되나요? 어떤 내용을 포함하고 있나요?"
									className="min-h-[120px] resize-none"
								/>
							</div>
						</div>
					</div>

					{/* Section 2: Target Audience */}
					<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
						<div className="border-b border-gray-100 px-6 py-4">
							<h2 className="heading-5 text-gray-900">대상 독자 설정</h2>
							<p className="text-gray-500 text-sm">
								이 체크리스트가 가장 도움이 될 대상을 설정해주세요. (필터링에 사용됩니다)
							</p>
						</div>
						<div className="p-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="stack-sm">
									<Label>대상 비자</Label>
									<Select name="targetVisa" options={VISA_OPTIONS}>
										<SelectTrigger>
											<SelectValue placeholder="비자 유형 선택 (선택)" />
										</SelectTrigger>
										<SelectContent />
									</Select>
                                    <p className="text-gray-400 text-xs text-muted-foreground">특정 비자 소지자를 위한 가이드라면 선택해주세요.</p>
								</div>

								<div className="stack-sm">
									<Label>가족 형태</Label>
									<Select name="familyStatus" options={FAMILY_OPTIONS}>
										<SelectTrigger>
											<SelectValue placeholder="가족 형태 선택 (선택)" />
										</SelectTrigger>
										<SelectContent />
									</Select>
                                    <p className="text-gray-400 text-xs text-muted-foreground">1인 가구, 가족 동반 등 대상을 지정할 수 있습니다.</p>
								</div>

								<div className="stack-sm md:col-span-2">
									<Label>지역</Label>
									<Select name="region" defaultValue="Tokyo" options={REGION_OPTIONS}>
										<SelectTrigger>
											<SelectValue placeholder="지역 선택" />
										</SelectTrigger>
										<SelectContent />
									</Select>
                                    <p className="text-gray-400 text-xs text-muted-foreground">주로 어느 지역에 해당하는 정보인가요?</p>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end pt-4 pb-20">
						<Button
							type="submit"
                            size="lg"
							disabled={isSubmitting}
							className="min-w-[200px]"
						>
							{isSubmitting ? "생성 중..." : "다음: 태스크 추가하기"}
						</Button>
					</div>
				</fetcher.Form>
			</div>
		</div>
	);
}
