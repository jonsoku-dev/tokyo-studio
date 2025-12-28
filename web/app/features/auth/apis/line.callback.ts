import { authenticator } from "~/features/auth/services/auth.server";
import { createUserSession } from "~/features/auth/utils/session.server";
import type { Route } from "./+types/line.callback";

export async function loader({ request }: Route.LoaderArgs) {
	// @ts-expect-error
	const userId = await authenticator.authenticate("line", request, {
		failureRedirect: "/login",
	});

	return createUserSession(userId, "/");
}
