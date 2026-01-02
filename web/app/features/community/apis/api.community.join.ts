import { requireUserId } from "../../auth/utils/session.server";
import { joinCommunity, leaveCommunity } from "../services/communities.server";
import type { Route } from "./+types/api.community.join";

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const intent = formData.get("intent") as "join" | "leave";
	const communityId = formData.get("communityId") as string;

	if (!communityId) {
		return { success: false, error: "Community ID is required" };
	}

	if (intent === "join") {
		return joinCommunity(userId, communityId);
	}
	if (intent === "leave") {
		return leaveCommunity(userId, communityId);
	}

	return { success: false, error: "Invalid intent" };
}
