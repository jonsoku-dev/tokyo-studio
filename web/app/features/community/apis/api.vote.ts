import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { handleVote } from "~/features/community/services/vote.server";
import {
	actionHandler,
	BadRequestError,
} from "~/shared/lib";

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const type = formData.get("type") as "post" | "comment";
	const id = formData.get("id") as string;
	const value = Number.parseInt(formData.get("value") as string, 10);

	if (!type || !id || Number.isNaN(value)) {
		throw new BadRequestError("Invalid parameters");
	}

	const ipAddress =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("remote-addr") ||
		"unknown";
	const userAgent = request.headers.get("user-agent") || "unknown";

	return handleVote(userId, type, id, value, ipAddress, userAgent);
});
