import { redirect } from "react-router";
import { actionHandler, loaderHandler } from "~/shared/lib";
import { authenticator } from "../services/auth.server";
import type { Route } from "./+types/api.line";

export const loader = loaderHandler(
	async ({ request: _request }: Route.LoaderArgs) => {
		return redirect("/login");
	},
);

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	return authenticator.authenticate("line", request);
});
