import { actionHandler, BadRequestError } from "~/shared/lib";
import { requireUserId } from "../../auth/utils/session.server";
import { joinCommunity, leaveCommunity } from "../services/communities.server";
import type { Route } from "./+types/api.community.join.server";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const intent = formData.get("intent") as "join" | "leave";
	const communityId = formData.get("communityId") as string;

	if (!communityId) {
		throw new BadRequestError("Community ID is required");
	}

	if (intent === "join") {
		return joinCommunity(userId, communityId);
	}
	if (intent === "leave") {
		return leaveCommunity(userId, communityId);
	}

	throw new BadRequestError("Invalid intent");
});
