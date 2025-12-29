import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { handleVote } from "~/features/community/services/vote.server";

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const type = formData.get("type") as "post" | "comment";
	const id = formData.get("id") as string;
	const value = Number.parseInt(formData.get("value") as string, 10);

	if (!type || !id || Number.isNaN(value)) {
		return data(
			{ success: false, error: "Invalid parameters" },
			{ status: 400 },
		);
	}

	const ipAddress =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("remote-addr") ||
		"unknown";
	const userAgent = request.headers.get("user-agent") || "unknown";

	try {
		const result = await handleVote(
			userId,
			type,
			id,
			value,
			ipAddress,
			userAgent,
		);
		return data({ success: true, ...result });
	} catch (error: unknown) {
		console.error("Vote failed:", error);
		return data(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
