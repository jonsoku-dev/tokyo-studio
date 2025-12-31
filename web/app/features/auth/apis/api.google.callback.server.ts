import { authenticator } from "~/features/auth/services/auth.server";
import { createUserSession } from "~/features/auth/utils/session.server";
import { loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.google.callback.server";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	// @ts-expect-error
	const userId = await authenticator.authenticate("google", request, {
		failureRedirect: "/login",
	});

	return createUserSession(userId, "/");
});
