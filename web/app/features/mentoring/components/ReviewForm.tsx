import { Form, useNavigation, useActionData } from "react-router";
import { Star } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
	sessionId: string;
	mentorName: string;
	onSuccess?: () => void;
}

export function ReviewForm({
	sessionId,
	mentorName,
	onSuccess,
}: ReviewFormProps) {
	const [rating, setRating] = useState<number>(0);
	const [hoverRating, setHoverRating] = useState<number>(0);
	const navigation = useNavigation();
	const actionData = useActionData<any>();
	const isSubmitting = navigation.state === "submitting";

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		if (!rating) {
			e.preventDefault();
			alert("Please select a rating");
			return;
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
			<h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
			<p className="text-gray-600 mb-6">
				Help us improve by sharing your feedback about your session with{" "}
				<strong>{mentorName}</strong>
			</p>

			{actionData?.error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
					{actionData.error}
				</div>
			)}

			{actionData?.success && (
				<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
					Thank you for your review! It helps mentors improve.
				</div>
			)}

			<Form
				method="post"
				action={`/api/mentoring/session/${sessionId}/review`}
				onSubmit={handleSubmit}
				className="space-y-6"
			>
				{/* Hidden fields */}
				<input type="hidden" name="sessionId" value={sessionId} />
				<input type="hidden" name="rating" value={rating || ""} />

				{/* Star Rating */}
				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">
						How would you rate this session?
					</label>
					<div className="flex gap-3">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onClick={() => setRating(star)}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								className="focus:outline-none transition-transform hover:scale-110"
							>
								<Star
									className={`h-8 w-8 transition-colors ${
										star <= (hoverRating || rating)
											? "fill-yellow-400 text-yellow-400"
											: "text-gray-300"
									}`}
								/>
							</button>
						))}
					</div>
					<p className="text-sm text-gray-500 mt-2">
						{rating > 0 && `You rated: ${rating} star${rating !== 1 ? "s" : ""}`}
					</p>
				</div>

				{/* Review Text */}
				<div>
					<label
						htmlFor="text"
						className="block text-sm font-semibold text-gray-900 mb-2"
					>
						Tell us more (optional)
					</label>
					<textarea
						id="text"
						name="text"
						rows={4}
						placeholder="What did you like? What could be improved? Be specific..."
						className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
						maxLength={2000}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Max 2000 characters
					</p>
				</div>

				{/* Anonymous Option */}
				<div>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							name="isAnonymous"
							className="h-4 w-4 rounded border-gray-300"
						/>
						<span className="text-sm text-gray-700">
							Post this review anonymously
						</span>
					</label>
					<p className="text-xs text-gray-500 mt-1">
						Your name won't be displayed, but the mentor can see your rating.
					</p>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isSubmitting || !rating}
					className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? "Submitting..." : "Submit Review"}
				</button>
			</Form>
		</div>
	);
}
