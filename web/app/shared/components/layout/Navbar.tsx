import { Menu, Search, User } from "lucide-react";
import { Link } from "react-router";
import { NotificationsPopover } from "~/features/community/components/NotificationsPopover";
import { Button } from "~/shared/components/ui/Button";

export function Navbar() {
	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14">
			<div className="container-wide h-full flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button type="button" className="btn btn-ghost btn-icon md:hidden">
						<Menu className="w-6 h-6 text-gray-700" />
					</button>
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary-500 rounded-full center">
							<span className="text-white font-bold text-lg">J</span>
						</div>
						<span className="hidden md:block font-display font-bold text-xl tracking-tight text-gray-900">
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
							className="input rounded-full pl-10"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Notifications (Desktop) */}
					<div className="hidden md:block">
						<NotificationsPopover />
					</div>

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
					<button type="button" className="btn btn-ghost btn-icon md:hidden">
						<Search className="w-6 h-6" />
					</button>
					<button type="button" className="btn btn-ghost btn-icon md:hidden">
						<User className="w-6 h-6" />
					</button>
				</div>
			</div>
		</header>
	);
}
