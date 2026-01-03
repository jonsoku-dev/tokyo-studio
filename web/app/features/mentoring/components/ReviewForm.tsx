import { Star } from "lucide-react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";

interface ReviewFormProps {
	sessionId: string;
	mentorName: string;
	onSuccess?: () => void;
}

export function ReviewForm({ sessionId, mentorName }: ReviewFormProps) {
	const [rating, setRating] = useState<number>(0);
	const [hoverRating, setHoverRating] = useState<number>(0);
	const navigation = useNavigation();
	// biome-ignore lint/suspicious/noExplicitAny: Action data is dynamic
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
		<div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-responsive shadow-sm">
			<h2 className="heading-3 mb-2">Share Your Experience</h2>
			<p className="mb-6 text-gray-600">
				Help us improve by sharing your feedback about your session with{" "}
				<strong>{mentorName}</strong>
			</p>

			{actionData?.error && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-responsive text-red-700">
					{actionData.error}
				</div>
			)}

			{actionData?.success && (
				<div className="mb-6 rounded-lg border border-accent-200 bg-accent-50 p-responsive text-accent-700">
					Thank you for your review! It helps mentors improve.
				</div>
			)}

			<Form
				method="post"
				action={`/api/mentoring/session/${sessionId}/review`}
				onSubmit={handleSubmit}
				className="stack-md"
			>
				{/* Hidden fields */}
				<input type="hidden" name="sessionId" value={sessionId} />
				<input type="hidden" name="rating" value={rating || ""} />

				{/* Star Rating */}
				<div>
					<span className="heading-5 mb-3 block text-sm">
						How would you rate this session?
					</span>
					<div className="flex gap-3">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onClick={() => setRating(star)}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								className="transition-transform hover:scale-110 focus:outline-none"
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
					<p className="caption mt-2">
						{rating > 0 &&
							`You rated: ${rating} star${rating !== 1 ? "s" : ""}`}
					</p>
				</div>

				{/* Review Text */}
				<div>
					<label htmlFor="text" className="heading-5 mb-2 block text-sm">
						Tell us more (optional)
					</label>
					<textarea
						id="text"
						name="text"
						rows={4}
						placeholder="What did you like? What could be improved? Be specific..."
						className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
						maxLength={2000}
					/>
					<p className="caption mt-1">Max 2000 characters</p>
				</div>

				{/* Anonymous Option */}
				<div>
					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							name="isAnonymous"
							className="h-4 w-4 rounded border-gray-300"
						/>
						<span className="text-gray-700 text-sm">
							Post this review anonymously
						</span>
					</label>
					<p className="caption mt-1">
						Your name won't be displayed, but the mentor can see your rating.
					</p>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isSubmitting || !rating}
					className="w-full rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					{isSubmitting ? "Submitting..." : "Submit Review"}
				</button>
			</Form>
		</div>
	);
}
