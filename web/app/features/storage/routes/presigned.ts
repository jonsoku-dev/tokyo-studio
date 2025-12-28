
import { requireUserId } from "~/features/auth/utils/session.server";
import { storageService } from "~/shared/services/storage.server";
import { nanoid } from "nanoid";
import type { Route } from "./+types/presigned";

export async function loader({ request }: Route.LoaderArgs) {
    await requireUserId(request); // Protect route

    const url = new URL(request.url);
    const filename = url.searchParams.get("filename");
    const contentType = url.searchParams.get("contentType");

    if (!filename || !contentType) {
        throw new Response("Missing filename or contentType", { status: 400 });
    }

    const ext = filename.split(".").pop();
    const key = `uploads/${nanoid()}.${ext}`;

    const { uploadUrl, publicUrl } = await storageService.getPresignedUrl(key, contentType);

    return { uploadUrl, publicUrl, key };
}
