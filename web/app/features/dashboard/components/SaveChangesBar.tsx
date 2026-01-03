import { SaveIcon, XCircle } from "lucide-react";
import { useFetcher, useRevalidator } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { useDashboardStore } from "../stores/dashboard.store";

/**
 * 하단 저장 바
 * - 저장 가능 시 Save 버튼 활성화
 * - Discard 버튼으로 변경사항 취소
 */
export function SaveChangesBar() {
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
	const hasChanges = useDashboardStore((s) => s.hasChanges);
	const isSaving = useDashboardStore((s) => s.isSaving);
	const widgets = useDashboardStore((s) => s.widgets);
	const markSaved = useDashboardStore((s) => s.markSaved);
	const discardChanges = useDashboardStore((s) => s.discardChanges);
	const setIsSaving = useDashboardStore((s) => s.setIsSaving);
	const setWidgets = useDashboardStore((s) => s.setWidgets);

	const handleSave = () => {
		if (!hasChanges) return;
		setIsSaving(true);
		fetcher.submit(
			{ action: "batch", widgets: JSON.stringify(widgets) },
			{ method: "post", action: "/api/dashboard/widgets" },
		);
	};

	// fetcher 상태 감시: 성공 시 store 업데이트 및 마크
	if (fetcher.state === "idle" && isSaving) {
		if (fetcher.data?.success) {
			// 서버에서 반환된 위젯 배열이 있으면 store에 반영
			if (fetcher.data.widgets) {
				setWidgets(fetcher.data.widgets);
			}
			markSaved();
			setIsSaving(false);
			revalidator.revalidate();
		}
	}

	return (
		<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex justify-center pb-8">
			{hasChanges && (
				<div className="slide-in-from-bottom-4 fade-in pointer-events-auto flex animate-in items-center gap-3 rounded-full bg-gray-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-sm duration-300">
					<span className="mr-2 font-medium text-sm">변경사항이 있습니다</span>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={discardChanges}
							disabled={isSaving}
							className="h-8 rounded-full text-gray-300 hover:bg-white/10 hover:text-white"
						>
							<XCircle className="mr-1.5 h-4 w-4" />
							취소
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={handleSave}
							disabled={isSaving}
							className="h-8 rounded-full border-none bg-indigo-600 font-medium text-white shadow-none hover:bg-indigo-500"
						>
							<SaveIcon className="mr-1.5 h-4 w-4" />
							저장하기
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
