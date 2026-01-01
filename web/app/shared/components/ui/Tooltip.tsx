import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

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
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Tooltip hover state management */}
			<div
				role="presentation"
				className="relative flex items-center"
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
			>
				{children}
			</div>
		</TooltipContext.Provider>
	);
}

export function TooltipTrigger({
	children,
	asChild: _asChild,
}: {
	children: React.ReactNode;
	asChild?: boolean;
}) {
	return <>{children}</>;
}

export function TooltipContent({
	children,
	side: _side = "top",
	className,
}: {
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}) {
	const context = React.useContext(TooltipContext);
	if (!context) throw new Error("TooltipContent must be used within Tooltip");

	return (
		<AnimatePresence>
			{context.open && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9, x: 10 }}
					animate={{ opacity: 1, scale: 1, x: 20 }}
					exit={{ opacity: 0, scale: 0.9, x: 10 }}
					transition={{ duration: 0.15 }}
					className={`absolute left-full z-50 ml-2 rounded-md bg-gray-900 px-3 py-1.5 text-white text-xs shadow-md ${className}`}
				>
					{children}
					{/* Arrow */}
					<div className="absolute top-1/2 left-0 -mt-1 -ml-1 h-2 w-2 -rotate-45 bg-gray-900" />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
