import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "sonner";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
	},
];

// Create a client for the app
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
		mutations: {
			retry: 1,
		},
	},
});

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<html lang="en" suppressHydrationWarning>
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<Meta />
					<Links />
				</head>
				<body suppressHydrationWarning className="antialiased">
					{children}
					<ScrollRestoration />
					<Scripts />
					<Analytics />
					{process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
				</body>
			</html>
		</QueryClientProvider>
	);
}

import { VerificationBanner } from "~/features/auth/components/VerificationBanner";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { NotificationPermissionPrompt } from "~/features/notifications/components/NotificationPermissionPrompt";
import { Global3DBackground } from "~/shared/components/layout/Global3DBackground";

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserFromRequest(request);

	return {
		ENV: {
			VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
		},
		user,
	};
}

export default function App({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;

	return (
		<>
			<Global3DBackground />
			{user && <VerificationBanner user={user} />}
			<Outlet />
			<NotificationPermissionPrompt />
			<Toaster richColors position="top-center" />
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-responsive pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
