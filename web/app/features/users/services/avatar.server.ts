import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { db } from "~/shared/db/client.server";
import { users } from "~/shared/db/schema";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

// Ensure upload directory exists
async function ensureUploadDir() {
	try {
		await mkdir(UPLOAD_DIR, { recursive: true });
	} catch (_error) {
		// Ignore if exists
	}
}

export const avatarService = {
	async uploadAvatar(userId: string, buffer: Buffer): Promise<string> {
		await ensureUploadDir();

		// basic validation via sharp metadata
		const metadata = await sharp(buffer).metadata();
		if (
			!metadata.format ||
			!["jpeg", "png", "webp"].includes(metadata.format)
		) {
			throw new Error(
				"Invalid image format. Only JPG, PNG, and WebP are allowed.",
			);
		}

		// Generate unique filename
		const filename = `${userId}-${Date.now()}.webp`;
		const filepath = path.join(UPLOAD_DIR, filename);

		// Resize to 800x800, convert to WebP, and save
		await sharp(buffer)
			.resize(800, 800, {
				fit: "cover",
				position: "center",
			})
			.toFormat("webp")
			.toFile(filepath);

		// Construct public URL
		const avatarUrl = `/uploads/avatars/${filename}`;

		// Update DB
		// First get old avatar to delete it later (optional clean up)
		const [currentUser] = await db
			.select({ avatarUrl: users.avatarUrl })
			.from(users)
			.where(eq(users.id, userId));

		if (currentUser?.avatarUrl) {
			const oldFilename = currentUser.avatarUrl.split("/").pop();
			if (oldFilename) {
				const oldPath = path.join(UPLOAD_DIR, oldFilename);
				try {
					await unlink(oldPath);
				} catch (e) {
					console.warn("Failed to delete old avatar:", e);
				}
			}
		}

		await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));

		return avatarUrl;
	},

	async deleteAvatar(userId: string) {
		const [currentUser] = await db
			.select({ avatarUrl: users.avatarUrl })
			.from(users)
			.where(eq(users.id, userId));

		if (currentUser?.avatarUrl) {
			const filename = currentUser.avatarUrl.split("/").pop();
			if (filename) {
				const filepath = path.join(UPLOAD_DIR, filename);
				try {
					await unlink(filepath);
				} catch (e) {
					console.warn("Failed to delete avatar file:", e);
				}
			}
		}

		await db.update(users).set({ avatarUrl: null }).where(eq(users.id, userId));
	},
};
