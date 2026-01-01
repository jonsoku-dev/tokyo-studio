import type { ReactNode } from "react";
import { Outlet, useFetcher, useSearchParams } from "react-router";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface ShellProps {
	children?: ReactNode;
}

export function Shell({ children }: ShellProps) {
	const [searchParams] = useSearchParams();
	const fetcher = useFetcher();
	const isUnverified = searchParams.get("unverified") === "true";
	const isSuccess = fetcher.data?.success;

	return (
		<div className="min-h-screen bg-surface flex flex-col">
			{isUnverified && !isSuccess && (
				<div className="bg-primary-500 text-white px-4 py-2 text-center text-sm font-medium">
					Please verify your email address to access all features. Don't see the
					email?{" "}
					<fetcher.Form
						method="post"
						action="/resend-verification"
						className="inline"
					>
						<button type="submit" className="underline hover:text-primary-100">
							Resend Verification Email
						</button>
					</fetcher.Form>
				</div>
			)}
			{isSuccess && (
				<div className="bg-accent-600 text-white px-4 py-2 text-center text-sm font-medium">
					Verification email sent! Please check your inbox.
				</div>
			)}
			<Navbar />
			<div className="container-wide flex flex-1">
				<aside className="hidden md:block w-64 py-6 pr-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
					<Sidebar />
				</aside>
				<main className="flex-1 py-6 px-4 md:px-0 min-w-0">
					{children || <Outlet />}
				</main>
			</div>
		</div>
	);
}
