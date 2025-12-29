import { requireVerifiedEmail } from "~/features/auth/services/require-verified-email.server";
import { commentsService } from "~/features/community/services/comments.server";
import type { Route } from "./+types/comments";

export async function action({ request }: Route.ActionArgs) {
	const user = await requireVerifiedEmail(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "create") {
		const content = formData.get("content") as string;
		const postId = formData.get("postId") as string;
		const parentId = (formData.get("parentId") as string) || undefined;

		if (!content || !postId) {
			return { error: "Missing required fields" };
		}

		await commentsService.createComment({
			content,
			postId,
			authorId: user.id,
			parentId,
		});

		return { success: true };
	}

	return { error: "Invalid intent" };
}
