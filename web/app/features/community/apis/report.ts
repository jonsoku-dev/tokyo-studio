import { requireUserId } from "~/features/auth/utils/session.server";
import { commentsService } from "~/features/community/services/comments.server";
import { actionHandler, BadRequestError } from "~/shared/lib";
import type { ActionFunctionArgs } from "react-router";

export const action = actionHandler(async ({ request, params }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const { commentId } = params;
	if (!commentId) throw new BadRequestError("Comment ID required");

	const formData = await request.formData();
	const reason = formData.get("reason") as string;

	if (!reason) throw new BadRequestError("Reason required");

	await commentsService.reportComment(commentId, userId, reason);
	return { success: true };
});
