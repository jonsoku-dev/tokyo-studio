import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

export function Button({
	className = "",
	variant = "primary",
	size = "md",
	fullWidth = false,
	children,
	...props
}: ButtonProps) {
	const baseStyles =
		"inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

	const variants = {
		primary:
			"bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 border border-transparent",
		secondary:
			"bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 border border-transparent",
		outline:
			"bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
		ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};

	const widthClass = fullWidth ? "w-full" : "";

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
