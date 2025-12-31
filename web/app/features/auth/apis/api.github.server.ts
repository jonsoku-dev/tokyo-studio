import { redirect } from "react-router";
import { authenticator } from "~/features/auth/services/auth.server";
import { actionHandler, loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.github.server";

export const loader = loaderHandler(async ({ request: _request }: Route.LoaderArgs) => {
	return redirect("/login");
});

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	return authenticator.authenticate("github", request);
});
