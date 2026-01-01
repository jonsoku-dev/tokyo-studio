import { MapPage } from "../components/MapPage.client";

/**
 * 도쿄 지도 통합 페이지
 * - 대화형 지도 표시
 * - 카테고리 필터링
 * - 위치 검색
 * - 길안내 기능
 */
export default function MapRoute() {
	return (
		<div className="flex h-screen flex-col bg-gray-50">
			{/* 헤더 */}
			<div className="border-b bg-white px-4 py-4 shadow-sm">
				<h1 className="heading-3">도쿄 정착 가이드 지도</h1>
				<p className="body-sm mt-1">
					구청, 은행, 이민국 등 필수 위치를 지도에서 확인하세요
				</p>
			</div>

			{/* 지도 컨테이너 */}
			<div className="flex-1 overflow-hidden p-4">
				<MapPage />
			</div>
		</div>
	);
}
