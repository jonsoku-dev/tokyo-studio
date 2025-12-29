import { cn } from "~/shared/utils/cn";

interface AvatarProps {
	src?: string;
	alt: string;
	className?: string;
	fallback?: string;
}

export function Avatar({ src, alt, className, fallback }: AvatarProps) {
	const initials = fallback || alt.slice(0, 2).toUpperCase();

	return (
		<div
			className={cn(
				"relative inline-block rounded-full overflow-hidden bg-gray-100 border border-gray-200",
				className,
			)}
		>
			{src ? (
				<img
					src={src}
					alt={alt}
					className="w-full h-full object-cover"
					onError={(e) => {
						e.currentTarget.style.display = "none";
						const parent = e.currentTarget.parentElement;
						if (parent) {
							const fallbackEl = document.createElement("div");
							fallbackEl.className =
								"w-full h-full flex items-center justify-center font-bold text-gray-400";
							fallbackEl.innerText = initials;
							parent.appendChild(fallbackEl);
						}
					}}
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
					{initials}
				</div>
			)}
		</div>
	);
}
