import {
	loadPaymentWidget,
	type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { requireUserId } from "../../auth/utils/session.server";
import type { Route } from "./+types/checkout";

// Test Client Key
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

export function meta() {
	return [{ title: "Checkout - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	// In real app, we might create an order here or just pass user info
	// For MVP, we generate client-side orderId for simplicity, but backend validation is crucial
	return { userId, customerKey: userId };
}

export default function Checkout({ loaderData }: Route.ComponentProps) {
	const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
	const paymentMethodsWidgetRef = useRef<ReturnType<
		PaymentWidgetInstance["renderPaymentMethods"]
	> | null>(null);
	const [price, _setPrice] = useState(50000); // 50,000 KRW
	const [orderId] = useState(nanoid());

	useEffect(() => {
		(async () => {
			const paymentWidget = await loadPaymentWidget(
				clientKey,
				loaderData.customerKey,
			);

			const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
				"#payment-widget",
				{ value: price },
				{ variantKey: "DEFAULT" },
			);

			paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

			paymentWidgetRef.current = paymentWidget;
			paymentMethodsWidgetRef.current = paymentMethodsWidget;
		})();
	}, [loaderData.customerKey, price]);

	const handlePayment = async () => {
		const paymentWidget = paymentWidgetRef.current;
		if (!paymentWidget) return;

		try {
			await paymentWidget.requestPayment({
				orderId,
				orderName: "Mentoring Session (1hr)",
				customerName: "User", // Fetch real name
				customerEmail: "user@example.com",
				successUrl: `${window.location.origin}/payment/success`,
				failUrl: `${window.location.origin}/payment/fail`,
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<PageHeader title="Checkout" className="mb-8 text-center" />
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<div id="payment-widget" />
				<div id="agreement" />

				<div className="mt-8 flex justify-end">
					<Button onClick={handlePayment} className="w-full py-6 text-lg">
						Pay {price.toLocaleString()} KRW
					</Button>
				</div>
			</div>
		</div>
	);
}
