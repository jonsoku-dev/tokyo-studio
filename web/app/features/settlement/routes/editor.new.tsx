import { db } from "@itcom/db/client";
import { settlementTemplates } from "@itcom/db/schema";
import { redirect, useFetcher } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { requireUserId } from "../../auth/utils/session.server";
import type { Route } from "./+types/editor.new";

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

	return (
		<div className="stack-md">
			<PageHeader
				title="체크리스트 만들기"
				description="나만의 정착 노하우를 공유해보세요. (e.g., 오사카 유학생 가이드)"
			/>

			<fetcher.Form
				method="post"
				className="stack-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
			>
				<div className="stack-sm">
					<label htmlFor="title" className="font-medium text-gray-700">
						제목
					</label>
					<input
						type="text"
						name="title"
						id="title"
						placeholder="예: 워킹홀리데이 100일 완성"
						className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						required
					/>
				</div>

				<div className="stack-sm">
					<label htmlFor="description" className="font-medium text-gray-700">
						설명
					</label>
					<textarea
						name="description"
						id="description"
						rows={4}
						placeholder="이 체크리스트는 어떤 사람들을 위한 것인가요?"
						className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="stack-sm">
						<label className="font-medium text-gray-700">대상 비자</label>
						<Select name="targetVisa">
							<SelectTrigger>
								<SelectValue placeholder="비자 유형 선택 (선택)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Engineer">기술/인문지식/국제업무</SelectItem>
								<SelectItem value="Student">유학</SelectItem>
								<SelectItem value="Working Holiday">워킹홀리데이</SelectItem>
								<SelectItem value="Dependent">가족체재</SelectItem>
								<SelectItem value="HSP">고도인재</SelectItem>
								<SelectItem value="Spouse">일본인의 배우자</SelectItem>
								<SelectItem value="Other">기타</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="stack-sm">
						<label className="font-medium text-gray-700">가족 형태</label>
						<Select name="familyStatus">
							<SelectTrigger>
								<SelectValue placeholder="가족 형태 선택 (선택)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Single">1인 (싱글)</SelectItem>
								<SelectItem value="Couple">2인 (부부/커플)</SelectItem>
								<SelectItem value="Family with Kids">자녀 동반</SelectItem>
								<SelectItem value="Pet Owner">반려동물 동반</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="stack-sm">
						<label className="font-medium text-gray-700">지역</label>
						<Select name="region" defaultValue="Tokyo">
							<SelectTrigger>
								<SelectValue placeholder="지역 선택" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Tokyo">도쿄 (Tokyo)</SelectItem>
								<SelectItem value="Osaka">오사카 (Osaka)</SelectItem>
								<SelectItem value="Fukuoka">후쿠오카 (Fukuoka)</SelectItem>
								<SelectItem value="Nagoya">나고야 (Nagoya)</SelectItem>
								<SelectItem value="Remote">기타/원격</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex justify-end pt-4">
					<button
						type="submit"
						disabled={fetcher.state !== "idle"}
						className="rounded-lg bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-700 disabled:opacity-50"
					>
						다음: 태스크 추가하기
					</button>
				</div>
			</fetcher.Form>
		</div>
	);
}
