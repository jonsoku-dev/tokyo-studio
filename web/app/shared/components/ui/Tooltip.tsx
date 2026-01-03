import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { cn } from "~/shared/utils/cn";

interface TooltipContextType {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(
	undefined,
);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);

	return (
		<TooltipContext.Provider value={{ open, setOpen }}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Wrapper catches mouse leave to close tooltip */}
			<div
				className="relative flex items-center"
				onMouseLeave={() => setOpen(false)}
			>
				{children}
			</div>
		</TooltipContext.Provider>
	);
}

export function TooltipTrigger({
	children,
	asChild,
}: {
	children: React.ReactNode;
	asChild?: boolean;
}) {
	const context = React.useContext(TooltipContext);
	if (!context) throw new Error("TooltipTrigger must be used within Tooltip");

	const handleMouseEnter = () => context.setOpen(true);
	// MouseLeave is handled by parent to catch gaps

	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<
			React.HTMLAttributes<HTMLElement>
		>;

		return React.cloneElement(child, {
			onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
				handleMouseEnter();
				child.props.onMouseEnter?.(e);
			},
		});
	}

	return (
		<button
			type="button"
			className="outline-none"
			onMouseEnter={handleMouseEnter}
		>
			{children}
		</button>
	);
}

export function TooltipContent({
	children,
	side = "top",
	sideOffset = 5,
	className,
}: {
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	className?: string;
}) {
	const context = React.useContext(TooltipContext);
	if (!context) throw new Error("TooltipContent must be used within Tooltip");

	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2",
		bottom: "top-full left-1/2 -translate-x-1/2",
		left: "right-full top-1/2 -translate-y-1/2",
		right: "left-full top-1/2 -translate-y-1/2",
	};

	const marginStyle = {
		top: { marginBottom: sideOffset },
		bottom: { marginTop: sideOffset },
		left: { marginRight: sideOffset },
		right: { marginLeft: sideOffset },
	};

	return (
		<AnimatePresence>
			{context.open && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.1 }}
					className={cn(
						"absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-white text-xs shadow-md",
						positionClasses[side],
						className,
					)}
					style={marginStyle[side]}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
