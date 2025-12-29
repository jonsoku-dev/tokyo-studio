import { requireUserId } from "~/features/auth/utils/session.server";
import { commentsService } from "~/features/community/services/comments.server";
import type { Route } from "./+types/comment-detail";

export async function action({ request, params }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const { commentId } = params;

	if (!commentId) {
		return { error: "Missing comment ID" };
	}

	const formData = await request.formData();
	const intent = formData.get("intent");

	if (request.method === "PATCH") {
		if (intent === "update") {
			const content = formData.get("content") as string;
			if (!content) return { error: "Content required" };

			await commentsService.updateComment(commentId, userId, content);
			return { success: true };
		}
	}

	if (request.method === "POST") {
		if (intent === "vote") {
			const type = Number(formData.get("type")) as 1 | -1;
			if (![1, -1].includes(type)) return { error: "Invalid vote type" };

			await commentsService.voteComment(commentId, userId, type);
			return { success: true };
		}

		if (intent === "delete") {
			await commentsService.deleteComment(commentId, userId);
			return { success: true };
		}
	}

	return { error: "Invalid action" };
}
