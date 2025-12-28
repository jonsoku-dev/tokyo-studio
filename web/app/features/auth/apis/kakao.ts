import { redirect } from "react-router";
import { authenticator } from "~/features/auth/services/auth.server";
import type { Route } from "./+types/kakao";

export async function loader({ request }: Route.LoaderArgs) {
	return redirect("/login");
}

export async function action({ request }: Route.ActionArgs) {
	return authenticator.authenticate("kakao", request);
}
