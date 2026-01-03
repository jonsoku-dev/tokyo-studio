interface PendingChangesBannerProps {
	count: number;
	isSaving: boolean;
	error?: string | null;
	onSave: () => void;
	onDiscard: () => void;
}

export function PendingChangesBanner({
	count,
	isSaving,
	error,
	onSave,
	onDiscard,
}: PendingChangesBannerProps) {
	return (
		<div
			className={`fixed right-0 bottom-0 left-0 z-50 border-t p-responsive shadow-lg ${
				error ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
			}`}
		>
			<div className="container-wide mx-auto flex w-full items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-full ${
							error ? "bg-red-200" : "bg-amber-200"
						}`}
					>
						{error ? (
							<span className="font-bold text-red-700 text-sm">!</span>
						) : (
							<span className="font-bold text-amber-700 text-sm">{count}</span>
						)}
					</div>
					<div className="flex-1">
						{error ? (
							<>
								<p className="font-medium text-red-900">저장 실패</p>
								<p className="text-red-600 text-xs">{error}</p>
							</>
						) : (
							<>
								<p className="font-medium text-amber-900">
									{count}개의 변경사항
									{isSaving ? " 저장 중..." : " 대기 중"}
								</p>
								<p className="text-amber-600 text-xs">
									{isSaving ? "" : "저장하지 않으면 변경사항이 사라집니다"}
								</p>
							</>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onDiscard}
						disabled={isSaving}
						className={`body-sm px-4 py-2 disabled:opacity-50 ${
							error
								? "text-red-700 hover:bg-red-100"
								: "text-amber-700 hover:bg-amber-100"
						}`}
					>
						취소
					</button>
					<button
						type="button"
						onClick={onSave}
						disabled={isSaving}
						className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
					>
						{isSaving ? (
							<>
								<span className="animate-spin">↻</span>
								저장 중...
							</>
						) : error ? (
							"다시 시도"
						) : (
							"저장하기"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
