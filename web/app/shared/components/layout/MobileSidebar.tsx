import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { NAVIGATION_ITEMS } from "~/shared/constants/navigation";
import { cn } from "~/shared/utils/cn";
import { Button } from "../ui/Button";

interface MobileSidebarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
	const location = useLocation();

	return (
		<Dialog
			open={open}
			onClose={() => onOpenChange(false)}
			className="relative z-50 md:hidden"
		>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 data-closed:opacity-0" />

			{/* Slide-over panel */}
			<div className="fixed inset-0 flex">
				<DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform flex-col bg-white p-responsive shadow-xl transition duration-300 data-closed:-translate-x-full">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="center h-8 w-8 rounded-full bg-primary-500">
								<span className="font-bold text-lg text-white">J</span>
							</div>
							<span className="font-bold font-display text-gray-900 text-xl tracking-tight">
								Japan IT Job
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					<nav className="mt-8 flex flex-col gap-2">
						{NAVIGATION_ITEMS.map((item) => {
							const isActive =
								location.pathname === item.href ||
								(item.href !== "/" && location.pathname.startsWith(item.href));
							return (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => onOpenChange(false)}
									className={cn(
										"flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors",
										isActive
											? "bg-primary-50 text-primary-700"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
									)}
								>
									<item.icon
										className={cn(
											"h-5 w-5",
											isActive ? "text-primary-500" : "text-gray-400",
										)}
									/>
									{item.name}
								</Link>
							);
						})}
					</nav>

					<div className="mt-8 border-gray-100 border-t pt-6">
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
				</DialogPanel>
			</div>
		</Dialog>
	);
}
