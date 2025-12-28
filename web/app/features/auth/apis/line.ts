import { redirect } from "react-router";
import { authenticator } from "~/features/auth/services/auth.server";
import type { Route } from "./+types/line";

export async function loader({ request: _request }: Route.LoaderArgs) {
	return redirect("/login");
}

export async function action({ request }: Route.ActionArgs) {
	return authenticator.authenticate("line", request);
}
