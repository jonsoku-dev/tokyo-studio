import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Star } from "lucide-react";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	Form,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
} from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Button } from "~/shared/components/ui/Button";
import { reviewService } from "../services/review.server";

// Loader: Check if session exists and is reviewable
export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const sessionId = params.sessionId;
	if (!sessionId) throw new Response("Not Found", { status: 404 });

	const session = await db.query.mentoringSessions.findFirst({
		where: eq(mentoringSessions.id, sessionId),
		with: {
			mentor: {
				with: {
					profile: true,
				},
			},
		},
	});

	if (!session || session.userId !== userId) {
		throw new Response("Not Found", { status: 404 });
	}

	// Check if already reviewed (optional, service also checks)
	const canReview = await reviewService.canReview(sessionId, userId);

	if (!canReview) {
		return redirect("/mentoring/bookings");
	}

	return { session };
}

// Action: Submit Review
export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const sessionId = params.sessionId;
	if (!sessionId) throw new Response("Not Found", { status: 404 });

	const formData = await request.formData();
	const rating = Number(formData.get("rating"));
	const comment = formData.get("comment") as string;

	if (!rating || rating < 1 || rating > 5) {
		return { error: "Rating must be between 1 and 5" };
	}

	try {
		// Fetch session to get mentorId
		const session = await db.query.mentoringSessions.findFirst({
			where: eq(mentoringSessions.id, sessionId),
		});
		if (!session) throw new Error("Session not found");

		await reviewService.createReview({
			sessionId,
			mentorId: session.mentorId,
			menteeId: userId,
			rating,
			text: comment,
		});

		return redirect("/mentoring/bookings");
	} catch (error) {
		console.error(error);
		return { error: "Failed to submit review" };
	}
}

export default function ReviewSessionPage() {
	const { session } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const actionData = useActionData<typeof action>();

	// Simple star rating state
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);

	return (
		<div className="center fixed inset-0 z-50 bg-black/80 p-responsive backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-responsive shadow-2xl">
				<h2 className="heading-3 mb-2">Rate your session</h2>
				<p className="mb-6 text-gray-400">
					How was your session with{" "}
					<span className="font-medium text-white">{session.mentor.name}</span>?
				</p>

				{actionData?.error && (
					<div className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-500 text-sm">
						{actionData.error}
					</div>
				)}

				<Form method="post" className="stack-md">
					{/* Star Rating */}
					<div className="flex justify-center gap-2">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								className="transition-transform hover:scale-110 focus:outline-none"
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => setRating(star)}
							>
								<Star
									className={`h-10 w-10 ${
										star <= (hoverRating || rating)
											? "fill-amber-400 text-amber-400"
											: "text-gray-600"
									}`}
								/>
							</button>
						))}
					</div>
					<input type="hidden" name="rating" value={rating} />

					{/* Comment */}
					<div>
						<label
							htmlFor="comment"
							className="mb-2 block font-medium text-gray-400 text-sm"
						>
							Share your feedback (optional)
						</label>
						<textarea
							name="comment"
							id="comment"
							rows={4}
							className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							placeholder="What did you learn? How was the mentor?"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Link
							to="/mentoring/bookings"
							className="inline-center cursor-pointer rounded-full bg-transparent px-4 py-2 font-medium text-base text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Cancel
						</Link>
						<Button type="submit" disabled={isSubmitting || rating === 0}>
							{isSubmitting ? "Submitting..." : "Submit Review"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
