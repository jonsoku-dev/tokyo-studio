import type { WidgetLayout } from "@itcom/db/schema";
import { FileText, FolderOpen, Upload } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface DocumentHubWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Document Hub Widget (P2)
 * 서류 허브 빠른 접근
 */
export default function DocumentHubWidget({
	size: _size,
	widgetData,
}: DocumentHubWidgetProps) {
	const { recentDocuments, typeCounts } = widgetData.documents;

	const totalDocs = Object.values(typeCounts).reduce((a, b) => a + b, 0);

	const formatDate = (date: Date) => {
		const d = new Date(date);
		const month = d.getMonth() + 1;
		const day = d.getDate();
		return `${month}/${day}`;
	};

	const maxItems = _size === "compact" ? 2 : 3;
	const displayDocs = recentDocuments.slice(0, maxItems);

	return (
		<div className="space-y-4">
			{/* 요약 카운트 */}
			{_size !== "compact" && (
				<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
					<div className="flex items-center gap-2">
						<FolderOpen className="h-5 w-5 text-primary-600" />
						<span className="font-medium text-gray-700 text-sm">내 서류함</span>
					</div>
					<span className="font-bold text-primary-600">{totalDocs}개</span>
				</div>
			)}

			{/* 최근 문서 */}
			<div className="space-y-2">
				<p className="text-gray-500 text-xs">최근 수정</p>
				{displayDocs.length > 0 ? (
					displayDocs.map((doc) => (
						<Link
							key={doc.id}
							to={`/documents/${doc.id}`}
							className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
						>
							<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
								<FileText className="h-4 w-4 text-primary-600" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-gray-900 text-sm transition-colors group-hover:text-primary-700">
									{doc.title}
								</p>
								<p className="text-gray-400 text-xs">
									{formatDate(doc.updatedAt)}
								</p>
							</div>
						</Link>
					))
				) : (
					<p className="py-4 text-center text-gray-400 text-sm">
						아직 업로드된 서류가 없습니다
					</p>
				)}
			</div>

			{/* 업로드 버튼 */}
			<Link
				to="/documents/upload"
				className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 border-dashed p-3 transition-colors hover:border-primary-400 hover:bg-primary-50/30"
			>
				<Upload className="h-4 w-4 text-gray-400" />
				<span className="text-gray-600 text-sm">새 서류 업로드</span>
			</Link>
		</div>
	);
}
