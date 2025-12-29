import { requireUserId } from "~/features/auth/utils/session.server";
import { commentsService } from "~/features/community/services/comments.server";
import type { Route } from "./+types/report";

export async function action({ request, params }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const { commentId } = params;
	if (!commentId) throw new Error("Comment ID required");

	const formData = await request.formData();
	const reason = formData.get("reason") as string;

	if (!reason) return { error: "Reason required" };

	try {
		await commentsService.reportComment(commentId, userId, reason);
		return { success: true };
	} catch (error) {
		return { error: error instanceof Error ? error.message : "Unknown error" };
	}
}
