import { loaderHandler } from "~/shared/lib";
import { authenticator } from "../services/auth.server";
import { createUserSession } from "../utils/session.server";
import type { Route } from "./+types/api.github.callback";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	// @ts-expect-error
	const userId = await authenticator.authenticate("github", request, {
		failureRedirect: "/login",
	});

	return createUserSession(userId, "/");
});
