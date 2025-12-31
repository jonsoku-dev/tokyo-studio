import { requireVerifiedEmail } from "~/features/auth/services/require-verified-email.server";
import { commentsService } from "~/features/community/services/comments.server";
import { actionHandler, BadRequestError } from "~/shared/lib";
import type { Route } from "./+types/api.comments.server";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const user = await requireVerifiedEmail(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "create") {
		const content = formData.get("content") as string;
		const postId = formData.get("postId") as string;
		const parentId = (formData.get("parentId") as string) || undefined;

		if (!content || !postId) {
			throw new BadRequestError("Missing required fields");
		}

		await commentsService.createComment({
			content,
			postId,
			authorId: user.id,
			parentId,
		});

		return { success: true };
	}

	throw new BadRequestError("Invalid intent");
});
