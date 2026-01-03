import type { ReactNode } from "react";
import { Outlet, useFetcher, useSearchParams } from "react-router";
import { Navbar } from "./Navbar";
import { SidebarDock } from "./SidebarDock";

interface ShellProps {
	children?: ReactNode;
	showSidebar?: boolean;
}

export function Shell({ children, showSidebar = true }: ShellProps) {
	const [searchParams] = useSearchParams();
	const fetcher = useFetcher();
	const isUnverified = searchParams.get("unverified") === "true";
	const isSuccess = fetcher.data?.success;

	return (
		<div className="flex min-h-screen flex-col">
			{isUnverified && !isSuccess && (
				<div className="bg-primary-500 px-4 py-2 text-center font-medium text-sm text-white">
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
				<div className="bg-accent-600 px-4 py-2 text-center font-medium text-sm text-white">
					Verification email sent! Please check your inbox.
				</div>
			)}
			<Navbar />
			<div className="container-wide flex flex-1">
				{showSidebar && <SidebarDock />}
				<main className="min-w-0 flex-1 p-responsive md:px-0 md:pl-24">
					{children || <Outlet />}
				</main>
			</div>
		</div>
	);
}
