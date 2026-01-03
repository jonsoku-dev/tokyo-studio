import {
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import { useRef } from "react";
import { Link, useLocation } from "react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/shared/components/ui/Tooltip";
import { NAVIGATION_ITEMS } from "~/shared/constants/navigation";
import { cn } from "~/shared/utils/cn";

export function SidebarDock() {
	const mouseY = useMotionValue(Infinity);

	return (
		<aside className="sticky top-0 z-40 hidden h-screen w-24 flex-col items-center justify-center md:flex">
			<motion.div
				onMouseMove={(e) => mouseY.set(e.pageY)}
				onMouseLeave={() => mouseY.set(Infinity)}
				className={cn(
					"flex w-16 flex-col items-center gap-2 overflow-visible rounded-2xl border border-gray-200 bg-white/80 py-3 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/20",
				)}
			>
				{/* Main Navigation */}
				{NAVIGATION_ITEMS.map((item) => (
					<DockIcon key={item.name} mouseY={mouseY} item={item} />
				))}
			</motion.div>
		</aside>
	);
}

function DockIcon({
	mouseY,
	item,
}: {
	mouseY: MotionValue;
	item: (typeof NAVIGATION_ITEMS)[number];
}) {
	const ref = useRef<HTMLDivElement>(null);

	const distance = useTransform(mouseY, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
		return val - bounds.y - bounds.height / 2;
	});

	const widthSync = useTransform(distance, [-150, 0, 150], [40, 72, 40]);
	const width = useSpring(widthSync, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const location = useLocation();
	const isActive =
		location.pathname === item.href ||
		(item.href !== "/" && location.pathname.startsWith(item.href));

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link to={item.href}>
					<motion.div
						ref={ref}
						style={{ width, height: width }}
						className={cn(
							"flex aspect-square items-center justify-center rounded-full transition-colors",
							isActive
								? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
								: "bg-gray-100 text-gray-500 hover:bg-gray-900 hover:text-white dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/90 dark:hover:text-black",
						)}
					>
						<item.icon className="h-1/2 w-1/2" />
					</motion.div>
				</Link>
			</TooltipTrigger>
			<TooltipContent side="bottom" sideOffset={10}>
				<p>{item.name}</p>
			</TooltipContent>
		</Tooltip>
	);
}
