import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { NAVIGATION_ITEMS } from "~/shared/constants/navigation";
import { cn } from "~/shared/utils/cn";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const location = useLocation();

	return (
		<nav className={cn("flex flex-col gap-6", className)}>
			{/* Main Navigation */}
			<div className="space-y-1">
				{NAVIGATION_ITEMS.map((item) => {
					const isActive =
						location.pathname === item.href ||
						(item.href !== "/" && location.pathname.startsWith(item.href));
					return (
						<NavLink
							key={item.name}
							href={item.href}
							icon={item.icon}
							isActive={isActive}
						>
							{item.name}
						</NavLink>
					);
				})}
			</div>

			{/* Resources Section */}
			<div>
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

// Reusable NavLink component
interface NavLinkProps {
	href: string;
	icon: LucideIcon;
	isActive: boolean;
	children: React.ReactNode;
}

function NavLink({ href, icon: Icon, isActive, children }: NavLinkProps) {
	return (
		<Link
			to={href}
			className={cn(
				"group flex items-center rounded-md px-3 py-2 font-medium text-sm transition-colors",
				isActive
					? "bg-gray-100 text-gray-900"
					: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
			)}
		>
			<Icon
				className={cn(
					"mr-3 h-5 w-5 flex-shrink-0 transition-colors",
					isActive
						? "text-gray-900"
						: "text-gray-400 group-hover:text-gray-500",
				)}
				aria-hidden="true"
			/>
			{children}
		</Link>
	);
}
