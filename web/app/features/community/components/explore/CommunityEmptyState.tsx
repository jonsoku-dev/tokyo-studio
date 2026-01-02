import { SearchX } from "lucide-react";
import { Link } from "react-router";

interface CommunityEmptyStateProps {
	search?: string;
}

export function CommunityEmptyState({ search }: CommunityEmptyStateProps) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
			<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 shadow-inner">
				<SearchX className="h-10 w-10 text-gray-300" />
			</div>
			<h3 className="mb-2 font-bold text-gray-900 text-xl">
				{search
					? `'${search}' 검색 결과가 없습니다`
					: "해당하는 커뮤니티가 없습니다"}
			</h3>
			<p className="mb-8 max-w-sm text-gray-500 text-sm">
				{search
					? "다른 키워드로 검색하거나 필터를 변경해보세요."
					: "현재 조건에 맞는 커뮤니티를 찾을 수 없습니다."}
			</p>

			<Link
				to="."
				className="rounded-full bg-primary-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-primary-500/40"
			>
				전체 커뮤니티 보기
			</Link>
		</div>
	);
}
