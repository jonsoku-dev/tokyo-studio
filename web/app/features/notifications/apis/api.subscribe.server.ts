import { db } from "@itcom/db/client";
import { pushSubscriptions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, BadRequestError } from "~/shared/lib";

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);

	if (request.method === "POST") {
		const formData = await request.formData();
		const subscriptionString = formData.get("subscription");

		if (!subscriptionString || typeof subscriptionString !== "string") {
			throw new BadRequestError("Invalid subscription data");
		}

		console.log("Subscription payload:", subscriptionString); // 디버깅용 로그 추가

		let subscription;
		try {
			subscription = JSON.parse(subscriptionString);
		} catch (_e) {
			throw new BadRequestError("Invalid JSON in subscription data");
		}

		const { endpoint, keys } = subscription;

		if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
			throw new BadRequestError("Invalid subscription format");
		}

		await db
			.insert(pushSubscriptions)
			.values({
				userId,
				endpoint,
				p256dh: keys.p256dh,
				auth: keys.auth,
			})
			.onConflictDoNothing({ target: pushSubscriptions.endpoint });

		return { success: true };
	}

	if (request.method === "DELETE") {
		const formData = await request.formData();
		const endpoint = formData.get("endpoint");

		if (!endpoint || typeof endpoint !== "string") {
			throw new BadRequestError("Invalid endpoint");
		}

		await db
			.delete(pushSubscriptions)
			.where(eq(pushSubscriptions.endpoint, endpoint));

		return { success: true };
	}

	throw new BadRequestError("Method not allowed");
});
