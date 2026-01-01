import clsx from "clsx";
import {
	Briefcase,
	CheckSquare,
	FileText,
	Home,
	Map as MapIcon,
	MessageSquare,
	Users,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const navigation = [
	{ name: "Home", href: "/", icon: Home },
	{ name: "My Roadmap", href: "/roadmap", icon: MapIcon },
	{ name: "Pipeline", href: "/pipeline", icon: Briefcase },
	{ name: "Documents", href: "/documents", icon: FileText },
	{ name: "Mentoring", href: "/mentoring", icon: Users },
	{ name: "Community", href: "/community", icon: MessageSquare },
	{ name: "Settle Tokyo", href: "/settle", icon: CheckSquare },
];

export function Sidebar() {
	const location = useLocation();

	return (
		<nav className="space-y-1">
			{navigation.map((item) => {
				const isActive = location.pathname === item.href;
				return (
					<Link
						key={item.name}
						to={item.href}
						className={clsx(
							"group flex items-center rounded-md px-3 py-2 font-medium text-sm transition-colors",
							isActive
								? "bg-gray-100 text-gray-900"
								: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
						)}
					>
						<item.icon
							className={clsx(
								"mr-3 h-5 w-5 flex-shrink-0 transition-colors",
								isActive
									? "text-gray-900"
									: "text-gray-400 group-hover:text-gray-500",
							)}
							aria-hidden="true"
						/>
						{item.name}
					</Link>
				);
			})}

			<div className="mt-4 border-gray-200 border-t pt-4">
				<h3 className="px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
					Resources
				</h3>
				<div className="mt-2 space-y-1">
					<div className="group flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 text-sm hover:bg-gray-50 hover:text-gray-900">
						<span className="truncate">Visa Guide</span>
					</div>
					<div className="group flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 text-sm hover:bg-gray-50 hover:text-gray-900">
						<span className="truncate">Resume Templates</span>
					</div>
				</div>
			</div>
		</nav>
	);
}
