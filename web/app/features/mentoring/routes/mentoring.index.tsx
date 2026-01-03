import { Search } from "lucide-react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { MentorCard } from "../components/MentorCard";
import { MentorFilters } from "../components/MentorFilters";
import { mentoringService } from "../services/mentoring.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const jobFamily = url.searchParams.get("jobFamily") || undefined;
	const minPrice = url.searchParams.get("minPrice")
		? Number(url.searchParams.get("minPrice"))
		: undefined;
	const maxPrice = url.searchParams.get("maxPrice")
		? Number(url.searchParams.get("maxPrice"))
		: undefined;

	const mentors = await mentoringService.getMentors({
		jobFamily,
		minPrice,
		maxPrice,
	});

	return { mentors };
}

export default function MentoringDirectory() {
	const { mentors } = useLoaderData<typeof loader>();

	return (
		<div className="stack-lg">
			{/* Header / Hero */}
			<PageHeader
				title="멘토 찾기"
				description="일본 IT 취업의 전문가들과 연결되어 커리어 조언을 받아보세요."
				className="pb-8"
			>
				{/* Search Bar */}
				<div className="relative max-w-lg pt-4">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pt-4 pl-3">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						placeholder="이름 또는 회사명 검색..."
						className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 leading-5 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
					/>
				</div>
			</PageHeader>

			<div className="grid gap-8 lg:grid-cols-[260px_1fr]">
				{/* Sidebar Filters */}
				<aside>
					<MentorFilters />
				</aside>

				{/* Mentor Grid */}
				<main>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="heading-4 flex items-center gap-2 text-gray-900">
							등록된 멘토
							<span className="caption rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600">
								{mentors.length}
							</span>
						</h2>
					</div>

					{mentors.length > 0 ? (
						<div className="grid gap-responsive sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
							{mentors.map((mentor) => (
								<MentorCard key={mentor.id} mentor={mentor} />
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 border-dashed bg-gray-50 py-24 text-center">
							<p className="body-lg text-gray-500">
								조건에 맞는 멘토를 찾을 수 없습니다.
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
