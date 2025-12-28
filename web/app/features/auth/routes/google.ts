
import { authenticator } from "~/features/auth/services/auth.server";
import { redirect } from "react-router";
import type { Route } from "./+types/google";

export async function loader({ request }: Route.LoaderArgs) {
    return redirect("/login");
}

export async function action({ request }: Route.ActionArgs) {
    return authenticator.authenticate("google", request);
}
