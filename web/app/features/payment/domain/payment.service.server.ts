import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@itcom/db/client";
import { payments } from "@itcom/db/schema";

const TOSS_SECRET_KEY =
	process.env.TOSS_SECRET_KEY || "test_sk_zRKbsKXchNyxdOQ1yL338ygwPVGv"; // Fallback to Test Key

export const paymentService = {
	async createOrder(userId: string, amount: number, specifiedOrderId?: string) {
		const orderId = specifiedOrderId || nanoid();
		// Check if exists to avoid unique constraint error
		const existing = await db.query.payments.findFirst({
			where: eq(payments.orderId, orderId),
		});

		if (existing) return existing;

		const [payment] = await db
			.insert(payments)
			.values({
				orderId,
				amount: String(amount),
				status: "READY",
				userId,
			})
			.returning();
		return payment;
	},

	async confirmPayment(paymentKey: string, orderId: string, amount: number) {
		// 1. Verify with Toss API
		const encryptedSecretKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString(
			"base64",
		);

		try {
			const response = await fetch(
				"https://api.tosspayments.com/v1/payments/confirm",
				{
					method: "POST",
					headers: {
						Authorization: `Basic ${encryptedSecretKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						paymentKey,
						orderId,
						amount,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				await db
					.update(payments)
					.set({ status: "ABORTED" })
					.where(eq(payments.orderId, orderId));
				throw new Error(error.message || "Payment confirmation failed");
			}

			const data = await response.json();

			// 2. Update DB
			const [updated] = await db
				.update(payments)
				.set({
					status: "DONE",
					paymentKey,
					method: data.method,
					updatedAt: new Date(),
				})
				.where(eq(payments.orderId, orderId))
				.returning();

			return updated;
		} catch (e: unknown) {
			await db
				.update(payments)
				.set({ status: "ABORTED" })
				.where(eq(payments.orderId, orderId));
			throw e;
		}
	},
};
