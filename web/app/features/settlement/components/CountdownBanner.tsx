interface CountdownBannerProps {
	arrivalDate: string;
}

export function CountdownBanner({ arrivalDate }: CountdownBannerProps) {
	const arrival = new Date(arrivalDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	arrival.setHours(0, 0, 0, 0);

	const diffTime = arrival.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	const isArrived = diffDays <= 0;
	const daysSinceArrival = Math.abs(diffDays);

	if (isArrived) {
		return (
			<div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-accent-100 text-sm font-medium">
							도쿄에 오신 것을 환영합니다! 🎉
						</p>
						<p className="heading-2 mt-1">
							{daysSinceArrival === 0
								? "오늘 도착!"
								: `도착 ${daysSinceArrival}일째`}
						</p>
					</div>
					<div className="text-6xl">✈️</div>
				</div>
			</div>
		);
	}

	const isUrgent = diffDays <= 14;

	return (
		<div
			className={`rounded-2xl p-6 text-white shadow-lg ${
				isUrgent
					? "bg-gradient-to-r from-red-500 to-primary-500"
					: "bg-gradient-to-r from-indigo-500 to-purple-600"
			}`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-white/80 text-sm font-medium">
						도쿄 도착까지 / 東京到着まで
					</p>
					<p className="heading-1 mt-1">D-{diffDays}</p>
					<p className="text-white/70 text-sm mt-1">
						{arrival.toLocaleDateString("ko-KR", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>
				<div className="text-6xl">{isUrgent ? "⏰" : "🗼"}</div>
			</div>
		</div>
	);
}
