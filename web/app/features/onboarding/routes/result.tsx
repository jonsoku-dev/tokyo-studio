import type { SelectProfile } from "@itcom/db/schema";
import {
	ArrowRight,
	Brain,
	Calendar,
	CheckCircle2,
	Download,
	Share2,
	Target,
	User,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { requireUserId } from "../../auth/utils/session.server";
import { profileService } from "../domain/profile.service.server";
import type { Route } from "./+types/result";

export function meta() {
	return [{ title: "커리어 진단 리포트 - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const profile = await profileService.getProfile(userId);

	if (!profile) {
		throw new Response("Profile not found", { status: 404 });
	}

	const { items, strategy } = profileService.calculateRecommendations(profile);

	return { profile, items, strategy };
}

interface RecommendationItem {
	title: string;
	type: string;
	description: string;
	tags?: string[];
}

export default function OnboardingResult({ loaderData }: Route.ComponentProps) {
	const { profile, items, strategy } = loaderData as {
		profile: SelectProfile;
		items: RecommendationItem[];
		strategy: string;
	};

	const today = new Date().toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const scores = {
		market:
			profile.jobFamily === "backend" || profile.jobFamily === "frontend"
				? 85
				: 70,
		visa: profile.hardConstraints?.degree !== "none" ? 90 : 60,
		language: profile.jpLevel === "N1" || profile.jpLevel === "N2" ? 95 : 40,
	};

	return (
		<div className="min-h-screen bg-gray-100 px-4 py-12 font-sans sm:px-6 lg:px-8">
			{/* A4 Paper Container - Aspect Ratio 210mm x 297mm approx 1:1.414 */}
			<div className="mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col bg-white shadow-xl">
				<div className="stack-lg flex-1 p-12 md:p-16">
					{/* Header Section */}
					<div className="flex flex-col items-start justify-between border-gray-900 border-b-2 pb-6 md:flex-row md:items-end">
						<div>
							<div className="mb-1 font-bold text-primary-600 text-sm uppercase tracking-wider">
								Japan IT Job Official Report
							</div>
							<h1 className="font-bold font-display text-4xl text-gray-900 tracking-tight">
								커리어 진단 리포트
							</h1>
							<p className="mt-2 flex items-center gap-2 text-gray-500 text-sm">
								<Calendar className="h-4 w-4" /> 발행일: {today}
							</p>
						</div>
						<div className="stack-xs mt-4 text-right md:mt-0">
							<div className="font-mono text-gray-400 text-xs">
								ID: {profile.id.slice(0, 8).toUpperCase()}
							</div>
							<div className="font-bold font-mono text-gray-900 text-lg">
								CONFIDENTIAL
							</div>
						</div>
					</div>

					{/* 1. Applicant Profile (Grid) */}
					<section className="stack-sm">
						<h2 className="flex items-center gap-2 font-bold font-display text-gray-900 text-lg uppercase tracking-wide">
							<User className="h-5 w-5 text-primary-600" />
							지원자 프로필
						</h2>
						<div className="grid grid-cols-2 gap-6 rounded-lg border border-gray-200 bg-gray-50 p-6 md:grid-cols-4">
							<div className="stack-xs">
								<div className="font-semibold text-gray-500 text-xs uppercase">
									직군
								</div>
								<div className="font-bold text-gray-900 capitalize">
									{profile.jobFamily}
								</div>
							</div>
							<div className="stack-xs">
								<div className="font-semibold text-gray-500 text-xs uppercase">
									연차/레벨
								</div>
								<div className="font-bold text-gray-900 capitalize">
									{profile.level}
								</div>
							</div>
							<div className="stack-xs">
								<div className="font-semibold text-gray-500 text-xs uppercase">
									일본어
								</div>
								<div className="font-bold text-gray-900">{profile.jpLevel}</div>
							</div>
							<div className="stack-xs">
								<div className="font-semibold text-gray-500 text-xs uppercase">
									희망 지역
								</div>
								<div className="font-bold text-gray-900">
									{profile.targetCity}
								</div>
							</div>
						</div>
					</section>

					{/* 2. Analysis & Scores */}
					<section className="grid gap-12 md:grid-cols-2">
						<div className="stack-sm">
							<h2 className="flex items-center gap-2 font-bold font-display text-gray-900 text-lg uppercase tracking-wide">
								<Brain className="h-5 w-5 text-primary-600" />
								진단 결과 요약
							</h2>
							<div className="stack-sm flex h-full flex-col justify-center rounded-lg border border-primary-100 bg-primary-50 p-6">
								<div className="font-semibold text-primary-600 text-sm uppercase">
									추천 전략
								</div>
								<div className="font-bold font-display text-3xl text-primary-900">
									{strategy.replace(/_/g, " ")}
								</div>
								<p className="text-primary-800 text-sm leading-relaxed">
									현재 보유하신 기술셋과 경력, 그리고 어학 능력을 종합적으로
									분석했을 때 가장 적합한 전략입니다.
								</p>
							</div>
						</div>
						<div className="stack-sm">
							<h2 className="flex items-center gap-2 font-bold font-display text-gray-900 text-lg uppercase tracking-wide">
								<Target className="h-5 w-5 text-primary-600" />
								시장 경쟁력 분석
							</h2>
							<div className="stack">
								<ScoreBar label="기술/직무 적합도" score={scores.market} />
								<ScoreBar label="비자 발급 가능성" score={scores.visa} />
								<ScoreBar label="언어 경쟁력" score={scores.language} />
							</div>
						</div>
					</section>

					{/* 3. Action Items */}
					<section className="stack-sm">
						<h2 className="flex items-center gap-2 font-bold font-display text-gray-900 text-lg uppercase tracking-wide">
							<CheckCircle2 className="h-5 w-5 text-primary-600" />
							맞춤형 실행 전략 (Prescription)
						</h2>
						<div className="divide-y divide-gray-100 border-gray-200 border-t">
							{items.map((item, idx) => (
								<div
									key={item.title}
									className="group -mx-4 flex items-start gap-6 rounded-lg px-4 py-6 transition-colors hover:bg-gray-50"
								>
									<div className="mt-1 flex-shrink-0 font-bold font-mono text-2xl text-primary-500 opacity-60">
										0{idx + 1}
									</div>
									<div className="stack-xs flex-1">
										<h3 className="font-bold text-gray-900 text-lg transition-colors group-hover:text-primary-700">
											{item.title}
										</h3>
										<p className="text-gray-600 leading-relaxed">
											{item.description}
										</p>
										{item.tags && (
											<div className="cluster-sm mt-2">
												{item.tags.map((tag) => (
													<span key={tag} className="tag bg-white text-xs">
														#{tag}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Stamp Area */}
					<div className="relative mt-auto flex items-center justify-end gap-6 pt-16">
						<div className="stack-xs text-right">
							<div className="font-medium text-gray-400 text-xs uppercase tracking-widest">
								Authorized by
							</div>
							<div className="font-bold font-display text-gray-900 text-lg">
								Japan IT Job Analysis Team
							</div>
						</div>
						{/* CSS Stamp Visual */}
						<div className="mask-image-grunge flex h-24 w-24 rotate-[-12deg] flex-col items-center justify-center rounded-full border-4 border-red-700/80 opacity-90 mix-blend-multiply">
							<div className="font-bold text-[10px] text-red-800 uppercase tracking-widest">
								Verified
							</div>
							<div className="my-1 w-16 border-red-800 border-t border-b py-1 text-center font-bold text-red-800 text-xs">
								APPROVED
							</div>
							<div className="font-bold text-[8px] text-red-800">{today}</div>
						</div>
					</div>
				</div>

				{/* Footer Actions (Screen Only) */}
				<div className="mt-auto flex flex-col items-center justify-between gap-4 border-gray-200 border-t bg-gray-50 p-6 sm:flex-row print:hidden">
					<div className="cluster">
						<Button variant="outline" onClick={() => window.print()}>
							<Download className="h-4 w-4" /> 인쇄하기
						</Button>
						<Button variant="outline">
							<Share2 className="h-4 w-4" /> 공유하기
						</Button>
					</div>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<Button asChild variant="secondary" className="w-full sm:w-auto">
							<Link to="/roadmap">
								로드맵 보기 <ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="primary"
							className="w-full shadow-lg shadow-primary-500/20 sm:w-auto"
						>
							<Link to="/">
								대시보드로 이동 <ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function ScoreBar({ label, score }: { label: string; score: number }) {
	return (
		<div className="w-full">
			<div className="mb-2 flex justify-between text-sm">
				<span className="font-medium text-gray-700">{label}</span>
				<span className="font-bold font-mono text-gray-900">{score}/100</span>
			</div>
			<div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full rounded-full bg-primary-600 transition-all duration-1000 ease-out"
					style={{ width: `${score}%` }}
				/>
			</div>
		</div>
	);
}
