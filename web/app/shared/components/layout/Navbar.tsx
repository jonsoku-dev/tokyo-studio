import { Menu, Search, User } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/shared/components/ui/Button";

export function Navbar() {
	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14">
			<div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						type="button"
						className="md:hidden p-1 hover:bg-gray-100 rounded-full"
					>
						<Menu className="w-6 h-6 text-gray-700" />
					</button>
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
							<span className="text-white font-bold text-lg">J</span>
						</div>
						<span className="hidden md:block font-bold text-xl tracking-tight text-gray-900">
							Japan IT Job
						</span>
					</Link>
				</div>

				<div className="flex-1 max-w-xl mx-4 hidden md:block">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search jobs, companies, guides..."
							className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link to="/login">
						<Button
							variant="secondary"
							size="sm"
							className="hidden md:inline-flex rounded-full"
						>
							Log In
						</Button>
					</Link>
					<Link to="/signup">
						<Button size="sm" className="rounded-full">
							Sign Up
						</Button>
					</Link>
					<button type="button" className="md:hidden p-1 text-gray-700">
						<Search className="w-6 h-6" />
					</button>
					<button type="button" className="md:hidden p-1 text-gray-700">
						<User className="w-6 h-6" />
					</button>
				</div>
			</div>
		</header>
	);
}
