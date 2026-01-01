import { Search } from "lucide-react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
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
		<div className="min-h-screen bg-black text-white selection:bg-primary/30">
			{/* Header / Hero */}
			<div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-primary/10 to-black pb-12 pt-24">
				<div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mask-gradient" />
				<div className="container relative mx-auto px-4">
					<h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight md:text-6xl">
						Find Your{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
							Mentor
						</span>
					</h1>
					<p className="mx-auto max-w-2xl text-center text-lg text-gray-400">
						Connect with industry experts who are ready to guide you.
					</p>

					{/* Search Bar */}
					<div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
						<Search className="h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name or company..."
							className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
						/>
					</div>
				</div>
			</div>

			<div className="container-page px-4 py-12">
				<div className="grid gap-8 lg:grid-cols-[280px_1fr]">
					{/* Sidebar Filters */}
					<aside>
						<MentorFilters />
					</aside>

					{/* Mentor Grid */}
					<main>
						<div className="mb-6 flex items-center justify-between">
							<h2 className="heading-4 flex items-center gap-2">
								Available Mentors
								<span className="rounded-full bg-white/10 px-2 py-0.5 caption">
									{mentors.length}
								</span>
							</h2>
						</div>

						{mentors.length > 0 ? (
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
								{mentors.map((mentor) => (
									<MentorCard key={mentor.id} mentor={mentor} />
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
								<p className="text-lg font-medium text-gray-400">
									No mentors found matching criteria.
								</p>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
}
