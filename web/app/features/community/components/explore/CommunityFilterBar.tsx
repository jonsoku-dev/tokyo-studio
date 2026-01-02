import * as LucideIcons from "lucide-react";
import { Compass, type LucideIcon, Search } from "lucide-react";
import { Form, Link, useSearchParams } from "react-router";
import { cn } from "~/shared/utils/cn";

interface Category {
	id: string;
	slug: string;
	name: string;
	icon: string;
}

interface CommunityFilterBarProps {
	categories: Category[];
}

export function CommunityFilterBar({ categories }: CommunityFilterBarProps) {
	const [searchParams] = useSearchParams();

	// Resolve Icon
	const getIcon = (iconName: string): LucideIcon => {
		// @ts-expect-error - Dynamic access
		return LucideIcons[iconName] || Compass;
	};

	// Category with "All" prepended
	const allCategories = [
		{ id: "all", slug: "all", name: "전체", icon: "Compass" },
		...categories,
	];

	return (
		<div className="space-y-6">
			{/* Search Bar */}
			<Form method="get" className="group relative">
				<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" />
				<input
					type="text"
					name="q"
					defaultValue={searchParams.get("q") ?? ""}
					placeholder="커뮤니티 검색..."
					className="w-full rounded-2xl border-none bg-white py-4 pr-24 pl-12 shadow-sm ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500"
				/>
				<button
					type="submit"
					className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2 font-bold text-sm text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg active:scale-95"
				>
					검색
				</button>
				{searchParams.get("category") && (
					<input
						type="hidden"
						name="category"
						value={searchParams.get("category") || ""}
					/>
				)}
			</Form>

			{/* Category Tabs */}
			<div
				id="all-communities"
				className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-4"
			>
				{allCategories.map((cat) => {
					const currentSlug = searchParams.get("category") || "all";
					const isActive = currentSlug === cat.slug;
					const Icon = getIcon(cat.icon);

					return (
						<Link
							key={cat.slug}
							to={cat.slug === "all" ? "." : `?category=${cat.slug}`}
							preventScrollReset
							className={cn(
								"flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 font-bold text-sm shadow-sm transition-all",
								isActive
									? "bg-primary-600 text-white shadow-primary-500/20 ring-2 ring-primary-600"
									: "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-primary-600",
							)}
						>
							<Icon className="h-4 w-4" />
							{cat.name}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
