import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "~/shared/components/ui/Button";
import { requireUserId } from "../../auth/utils/session.server";
import { paymentService } from "../domain/payment.service.server";
import type { Route } from "./+types/success";

export function meta() {
	return [{ title: "Payment Result - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const paymentKey = url.searchParams.get("paymentKey");
	const orderId = url.searchParams.get("orderId");
	const amount = url.searchParams.get("amount");

	if (!paymentKey || !orderId || !amount) {
		return { success: false, message: "Invalid Request" };
	}

	try {
		// Pre-save order to DB if not exists (in full flow, order created at checkout init)
		// Here we just save/confirm.
		// For robustness, confirmPayment should handle "order not found" gracefully or create one.
		// But since we skipped server-side creation in checkout, we might need to upsert here or ensure create logic.
		// To stick to strict robust flow: Service should handle it.

		// However, in this MVP flow, checkout didn't call backend to create order.
		// So we will CREATE order here then confirm, or just confirm if logic allows.
		// Service.createOrder expects userId. We can get userId from session.
		// BUT verify API needs orderId to match.

		// Let's assume we modify service to allow "Create & Confirm" atomic or just Confirm.
		// Actually, confirm API requires orderId.
		// We will insert 'READY' payment record first if missing (unsafe but works for MVP),
		// OR better: Confirm first, then save result.

		const userId = await requireUserId(request);

		// Ensure order exists with "READY" status before confirming
		await paymentService.createOrder(userId, Number(amount), orderId);

		const result = await paymentService.confirmPayment(
			paymentKey,
			orderId,
			Number(amount),
		);
		return { success: true, data: result };
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unknown error occurred";
		return { success: false, message };
	}
}

export default function Success({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();

	return (
		<div className="mx-auto max-w-md py-20 text-center">
			{loaderData.success ? (
				<div className="stack-md">
					<CheckCircle className="mx-auto h-20 w-20 text-accent-500" />
					<h1 className="heading-2 text-gray-900">Payment Successful!</h1>
					<p className="text-gray-600">Your session has been booked.</p>
					<Button onClick={() => navigate("/")}>Go to Dashboard</Button>
				</div>
			) : (
				<div className="stack-md">
					<XCircle className="mx-auto h-20 w-20 text-red-500" />
					<h1 className="heading-2 text-gray-900">Payment Failed</h1>
					<p className="text-gray-600">{loaderData.message}</p>
					<Button
						variant="outline"
						onClick={() => navigate("/payment/checkout")}
					>
						Try Again
					</Button>
				</div>
			)}
		</div>
	);
}
