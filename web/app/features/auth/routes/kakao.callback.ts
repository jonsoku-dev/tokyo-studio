
import { authenticator } from "~/features/auth/services/auth.server";
import { createUserSession } from "~/features/auth/utils/session.server";
import type { Route } from "./+types/kakao.callback";

export async function loader({ request }: Route.LoaderArgs) {
    // @ts-ignore
    const userId = await authenticator.authenticate("kakao", request, {
        failureRedirect: "/login",
    });

    return createUserSession(userId, "/");
}
