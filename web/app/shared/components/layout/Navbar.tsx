import type { User } from "@itcom/db/schema";
import {
	LogOut,
	Menu as MenuIcon,
	Search,
	Settings,
	User as UserIcon,
} from "lucide-react";
import { Form, Link, useRouteLoaderData } from "react-router";
import { NotificationsPopover } from "~/features/community/components/NotificationsPopover";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Button } from "~/shared/components/ui/Button";
import {
	Dropdown,
	DropdownContent,
	DropdownLink,
	DropdownSeparator,
	DropdownTrigger,
} from "~/shared/components/ui/Dropdown";

export function Navbar() {
	const data = useRouteLoaderData("root") as { user: User };
	const user = data?.user;

	return (
		<header className="sticky top-0 z-50 h-14 border-gray-200 border-b bg-white">
			<div className="container-wide flex h-full items-center justify-between">
				<div className="flex items-center gap-4">
					<button type="button" className="btn btn-ghost btn-icon md:hidden">
						<MenuIcon className="h-6 w-6 text-gray-700" />
					</button>
					<Link to="/" className="flex items-center gap-2">
						<div className="center h-8 w-8 rounded-full bg-primary-500">
							<span className="font-bold text-lg text-white">J</span>
						</div>
						<span className="hidden font-bold font-display text-gray-900 text-xl tracking-tight md:block">
							Japan IT Job
						</span>
					</Link>
				</div>

				<div className="mx-4 hidden max-w-xl flex-1 md:block">
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search jobs, companies, guides..."
							className="input rounded-full pl-10"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Notifications (Desktop) */}
					{user && (
						<div className="hidden md:block">
							<NotificationsPopover />
						</div>
					)}

					{user ? (
						<Dropdown>
							<DropdownTrigger className="flex rounded-full bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
								<span className="sr-only">Open user menu</span>
								<Avatar
									src={user.avatarUrl || undefined}
									alt={user.displayName || user.name}
									fallback={user.email?.[0]?.toUpperCase()}
									className="h-9 w-9"
								/>
							</DropdownTrigger>
							<DropdownContent anchor="bottom end" className="w-48">
								<div className="mb-1 border-gray-100 border-b px-2 py-1.5">
									<p className="truncate font-medium text-gray-900 text-sm">
										{user.displayName || user.name}
									</p>
									<p className="truncate text-gray-500 text-xs">{user.email}</p>
								</div>

								<DropdownLink to="/profile">
									<UserIcon className="h-4 w-4" />
									Your Profile
								</DropdownLink>
								<DropdownLink to="/settings/profile">
									<Settings className="h-4 w-4" />
									Settings
								</DropdownLink>

								<DropdownSeparator />

								<div className="p-1">
									<Form action="/logout" method="post">
										<button
											type="submit"
											className="group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-red-600 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-700"
										>
											<LogOut className="h-4 w-4" />
											Sign out
										</button>
									</Form>
								</div>
							</DropdownContent>
						</Dropdown>
					) : (
						<>
							<Link to="/login">
								<Button
									variant="secondary"
									size="sm"
									className="hidden rounded-full md:inline-flex"
								>
									Log In
								</Button>
							</Link>
							<Link to="/signup">
								<Button size="sm" className="rounded-full">
									Sign Up
								</Button>
							</Link>
						</>
					)}

					<button type="button" className="btn btn-ghost btn-icon md:hidden">
						<Search className="h-6 w-6" />
					</button>
					{!user && (
						<button type="button" className="btn btn-ghost btn-icon md:hidden">
							<UserIcon className="h-6 w-6" />
						</button>
					)}
				</div>
			</div>
		</header>
	);
}
