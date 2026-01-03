import { Briefcase, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";

interface ApplicationsHelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ApplicationsHelpModal({
	isOpen,
	onClose,
}: ApplicationsHelpModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>지원 현황 관리 가이드</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="rounded-lg bg-primary-50 p-4">
						<h3 className="flex items-center gap-2 font-bold text-lg text-primary-900">
							<Sparkles className="h-5 w-5 text-primary-600" />
							Magic Paste (채용공고 자동 분석)
						</h3>
						<p className="mt-2 text-primary-800 text-sm">
							채용 사이트(LinkedIn, Indeed, Wantedly 등)의 URL만 붙여넣으세요.
							기업명, 포지션, 공고 내용을 자동으로 분석하여 입력해드립니다.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<section className="space-y-3">
							<h4 className="flex items-center gap-2 font-semibold text-gray-900">
								<Briefcase className="h-4 w-4" />
								전형 단계 관리
							</h4>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2">
									<span className="font-medium text-gray-900">• 관심:</span>
									지원할지 고민 중인 공고
								</li>
								<li className="flex gap-2">
									<span className="font-medium text-gray-900">• 서류제출:</span>
									이력서 제출 완료
								</li>
								<li className="flex gap-2">
									<span className="font-medium text-gray-900">• 과제전형:</span>
									코딩테스트/과제 진행 중
								</li>
								<li className="flex gap-2">
									<span className="font-medium text-gray-900">• 면접:</span>
									1차~3차 면접 진행
								</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h4 className="flex items-center gap-2 font-semibold text-gray-900">
								<TrendingUp className="h-4 w-4" />팁 & 노하우
							</h4>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
									<span>드래그 앤 드롭으로 상태를 쉽게 변경하세요.</span>
								</li>
								<li className="flex gap-2">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
									<span>'다음 할 일'을 입력해 면접 일정을 놓치지 마세요.</span>
								</li>
								<li className="flex gap-2">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
									<span>관련된 이력서를 연결하여 이력을 관리하세요.</span>
								</li>
							</ul>
						</section>
					</div>

					<div className="border-gray-100 border-t pt-4 text-center">
						<p className="text-gray-500 text-sm">
							궁금한 점이 더 있으신가요?{" "}
							<a href="/community" className="text-primary-600 hover:underline">
								커뮤니티에 질문하기
							</a>
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
