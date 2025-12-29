import { eq } from "drizzle-orm";
import { type ActionFunction, data } from "react-router"; // or json
import { requireUserId } from "~/features/auth/utils/session.server";
import { db } from "@itcom/db/client";
import { pushSubscriptions } from "@itcom/db/schema";

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);

	if (request.method === "POST") {
		const formData = await request.formData();
		const subscriptionString = formData.get("subscription");

		if (!subscriptionString || typeof subscriptionString !== "string") {
			return data({ error: "Invalid subscription data" }, { status: 400 });
		}

		const subscription = JSON.parse(subscriptionString);
		const { endpoint, keys } = subscription;

		if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
			return data({ error: "Invalid subscription format" }, { status: 400 });
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

		return data({ success: true });
	}

	if (request.method === "DELETE") {
		const formData = await request.formData();
		const endpoint = formData.get("endpoint");

		if (!endpoint || typeof endpoint !== "string") {
			return data({ error: "Invalid endpoint" }, { status: 400 });
		}

		await db
			.delete(pushSubscriptions)
			.where(eq(pushSubscriptions.endpoint, endpoint));

		return data({ success: true });
	}

	return data({ error: "Method not allowed" }, { status: 405 });
};
