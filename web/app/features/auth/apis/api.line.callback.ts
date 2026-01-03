import { authenticator } from "../services/auth.server";
import { createUserSession } from "../utils/session.server";
import { loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.line.callback.server";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	// @ts-expect-error
	const userId = await authenticator.authenticate("line", request, {
		failureRedirect: "/login",
	});

	return createUserSession(userId, "/");
});
