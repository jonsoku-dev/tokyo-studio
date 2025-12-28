import type { ReactNode } from "react";
import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface ShellProps {
	children?: ReactNode;
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="min-h-screen bg-gray-100 flex flex-col">
			<Navbar />
			<div className="flex flex-1 max-w-7xl w-full mx-auto">
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
