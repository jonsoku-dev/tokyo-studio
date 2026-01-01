import { data, Link, useLoaderData, useSearchParams } from "react-router";
import { MarketplaceFilterBar } from "~/features/settlement/components/MarketplaceFilterBar";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { settlementService } from "../services/settlement.server";
import type { Route } from "./+types/marketplace";

export function meta() {
	return [{ title: "Settlement Marketplace - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const targetVisa = url.searchParams.get("targetVisa") || undefined;
	const familyStatus = url.searchParams.get("familyStatus") || undefined;
	const region = url.searchParams.get("region") || undefined;

	const templates = await settlementService.getTemplates({
		targetVisa: targetVisa === "all" ? undefined : targetVisa,
		familyStatus: familyStatus === "all" ? undefined : familyStatus,
		region: region === "all" ? undefined : region,
	});

	return data({ templates });
}

export default function SettlementMarketplace() {
	const { templates } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	const handleFilterChange = (key: string, value: string) => {
		const newParams = new URLSearchParams(searchParams);
		if (value === "all") {
			newParams.delete(key);
		} else {
			newParams.set(key, value);
		}
		setSearchParams(newParams);
	};

	const resetFilters = () => {
		setSearchParams(new URLSearchParams());
	};

	return (
		<div className="stack-md">
			<PageHeader
				title="📦 정착 체크리스트 마켓플레이스"
				description="다른 사람들이 만든 체크리스트를 찾아 내 로드맵에 추가해보세요."
				actions={
					<div className="flex items-center gap-2">
						<Link
							to="/settlement"
							className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
						>
							← 내 로드맵
						</Link>
						<Link
							to="/settlement/marketplace/my"
							className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
						>
							📂 내가 만든 체크리스트
						</Link>
						<Link
							to="/settlement/editor/new"
							className="rounded-lg bg-gray-900 px-4 py-2 font-bold text-white hover:bg-gray-800"
						>
							+ 만들기
						</Link>
					</div>
				}
			/>

			<MarketplaceFilterBar
				targetVisa={searchParams.get("targetVisa") || "all"}
				familyStatus={searchParams.get("familyStatus") || "all"}
				region={searchParams.get("region") || "all"}
				onVisaChange={(v) => handleFilterChange("targetVisa", v)}
				onFamilyChange={(v) => handleFilterChange("familyStatus", v)}
				onRegionChange={(v) => handleFilterChange("region", v)}
				onReset={resetFilters}
			/>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{templates.length === 0 ? (
					<div className="col-span-full py-12 text-center text-gray-500">
						조건에 맞는 체크리스트가 없습니다.
					</div>
				) : (
					templates.map((template) => (
						<Link
							key={template.id}
							to={`/settlement/marketplace/${template.id}`}
							className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
						>
							<div className="p-6">
								<div className="mb-4 flex items-start justify-between">
									<div className="flex flex-wrap items-center gap-2">
										{template.isOfficial && (
											<span className="rounded bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
												OFFICIAL
											</span>
										)}
										{template.region && (
											<span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
												📍 {template.region}
											</span>
										)}
									</div>
								</div>

								<h3 className="heading-5 mb-2 group-hover:text-primary-600">
									{template.title}
								</h3>
								<p className="body-sm mb-4 line-clamp-2 text-gray-600">
									{template.description}
								</p>

								<div className="flex flex-wrap gap-2 mb-4">
									{template.targetVisa && (
										<span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
											{template.targetVisa}
										</span>
									)}
									{template.familyStatus && (
										<span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
											{template.familyStatus}
										</span>
									)}
								</div>

								<div className="flex items-center gap-2 text-sm text-gray-500">
									<span>
										By{" "}
										{template.author?.displayName ||
											template.author?.name ||
											"Unknown"}
									</span>
									<span>•</span>
									<span>v{template.version}</span>
								</div>

								{/* Tags - Keeping original tags field as well */}
								{template.tags &&
									Array.isArray(template.tags) &&
									template.tags.length > 0 && (
										<div className="mt-4 flex flex-wrap gap-2">
											{template.tags.map((tag: string) => (
												<span
													key={tag}
													className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
												>
													#{tag}
												</span>
											))}
										</div>
									)}
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
