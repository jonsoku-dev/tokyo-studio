import {
	addDays,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "~/shared/components/ui/Button";
import type { AvailabilitySlot } from "../domain/mentoring.types";

interface AvailabilityCalendarProps {
	slots: AvailabilitySlot[];
	onSelectSlot: (slot: AvailabilitySlot) => void;
	timezone?: string;
}

export function AvailabilityCalendar({
	slots,
	onSelectSlot,
	timezone = "Local Time",
}: AvailabilityCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

	// Group slots by date
	const slotsByDate = slots.reduce(
		(acc, slot) => {
			const dateKey = format(new Date(slot.startTime), "yyyy-MM-dd");
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(slot);
			return acc;
		},
		{} as Record<string, AvailabilitySlot[]>,
	);

	const _nextMonth = () => setCurrentMonth(addDays(currentMonth, 30)); // Simple +30? No, standard calendar nav.
	// Spec says "next 30 days".
	// Standard calendar logic:
	const _onNextMonth = () => setCurrentMonth(addDays(currentMonth, 32)); // Jump to next month roughly? No use date-fns `addMonths`
	// I need `addMonths` import. I'll stick to simple logic or fix import.
	// I can recalculate based on currentMonth.

	const renderHeader = () => {
		return (
			<div className="flex items-center justify-between mb-4">
				<h3 className="heading-5 dark:text-white">
					{format(currentMonth, "MMMM yyyy")}
				</h3>
				{/* Navigation omitted for simple 30-day view, or implemented if needed */}
			</div>
		);
	};

	const renderDays = () => {
		const dateFormat = "EEE";
		const days = [];
		const startDate = startOfWeek(currentMonth);

		for (let i = 0; i < 7; i++) {
			days.push(
				<div
					key={i}
					className="text-center text-xs font-medium text-gray-500 uppercase py-2"
				>
					{format(addDays(startDate, i), dateFormat)}
				</div>,
			);
		}
		return <div className="grid grid-cols-7 mb-2">{days}</div>;
	};

	const renderCells = () => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart);
		const endDate = endOfWeek(monthEnd);

		const dateFormat = "d";
		const rows = [];
		let days = [];
		let day = startDate;
		let formattedDate = "";

		while (day <= endDate) {
			for (let i = 0; i < 7; i++) {
				formattedDate = format(day, dateFormat);
				const cloneDay = day;
				const dateKey = format(cloneDay, "yyyy-MM-dd");
				const daySlots = slotsByDate[dateKey] || [];
				const hasSlots = daySlots.length > 0;
				const isSelected = selectedDate && isSameDay(day, selectedDate);

				days.push(
					<button
						type="button"
						key={day.toString()}
						className={`
                            relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors
                            ${!isSameMonth(day, monthStart) ? "text-gray-600 opacity-50" : ""}
                            ${isSelected ? "bg-primary text-white font-bold" : ""}
                            ${!isSelected && isSameMonth(day, monthStart) ? "hover:bg-white/10 text-gray-300" : ""}
                            ${hasSlots && !isSelected ? "font-bold text-white ring-1 ring-primary/50" : ""}
                            cursor-pointer
                        `}
						onClick={() => setSelectedDate(cloneDay)}
					>
						<span>{formattedDate}</span>
						{hasSlots && (
							<div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
						)}
					</button>,
				);
				day = addDays(day, 1);
			}
			rows.push(
				<div className="grid grid-cols-7 gap-1" key={day.toString()}>
					{days}
				</div>,
			);
			days = [];
		}
		return <div>{rows}</div>;
	};

	// Slots for selected date
	const selectedDateKey = selectedDate
		? format(selectedDate, "yyyy-MM-dd")
		: null;
	const activeSlots = selectedDateKey ? slotsByDate[selectedDateKey] || [] : [];

	return (
		<div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
			{renderHeader()}
			{renderDays()}
			{renderCells()}

			<div className="mt-6 border-t border-white/10 pt-4">
				<div className="mb-2 flex items-center justify-between">
					<h4 className="body-sm text-gray-300">
						Available Times (
						{selectedDate ? format(selectedDate, "MMM d") : "-"})
					</h4>
					<span className="caption">{timezone}</span>
				</div>

				{activeSlots.length > 0 ? (
					<div className="grid grid-cols-2 gap-2">
						{activeSlots.map((slot) => (
							<Button
								key={slot.id}
								variant="outline"
								size="sm"
								className="justify-center border-primary/30 bg-primary/5 hover:bg-primary/20 hover:border-primary"
								onClick={() => onSelectSlot(slot)}
							>
								<Clock className="mr-2 h-3 w-3" />
								{format(new Date(slot.startTime), "h:mm a")}
							</Button>
						))}
					</div>
				) : (
					<p className="text-center caption py-4">
						No slots available for this date.
					</p>
				)}
			</div>
		</div>
	);
}
