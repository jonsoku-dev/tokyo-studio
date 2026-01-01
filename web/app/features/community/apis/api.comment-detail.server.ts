import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { commentsService } from "~/features/community/services/comments.server";
import { actionHandler, BadRequestError } from "~/shared/lib";

export const action = actionHandler(
	async ({ request, params }: ActionFunctionArgs) => {
		const userId = await requireUserId(request);
		const { commentId } = params;

		if (!commentId) {
			throw new BadRequestError("Missing comment ID");
		}

		const formData = await request.formData();
		const intent = formData.get("intent");

		if (request.method === "PATCH") {
			if (intent === "update") {
				const content = formData.get("content") as string;
				if (!content) throw new BadRequestError("Content required");

				await commentsService.updateComment(commentId, userId, content);
				return { success: true };
			}
		}

		if (request.method === "POST") {
			if (intent === "vote") {
				const type = Number(formData.get("type")) as 1 | -1;
				if (![1, -1].includes(type))
					throw new BadRequestError("Invalid vote type");

				await commentsService.voteComment(commentId, userId, type);
				return { success: true };
			}

			if (intent === "delete") {
				await commentsService.deleteComment(commentId, userId);
				return { success: true };
			}
		}

		throw new BadRequestError("Invalid action");
	},
);
