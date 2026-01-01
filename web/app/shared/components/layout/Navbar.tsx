import { Menu, Transition } from "@headlessui/react";
import type { User } from "@itcom/db/schema";
import {
	LogOut,
	Menu as MenuIcon,
	Search,
	Settings,
	User as UserIcon,
} from "lucide-react";
import { Fragment } from "react";
import { Form, Link, useRouteLoaderData } from "react-router";
import { NotificationsPopover } from "~/features/community/components/NotificationsPopover";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Button } from "~/shared/components/ui/Button";
import { cn } from "~/shared/utils/cn";

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
						<Menu as="div" className="relative ml-2">
							<Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
								<span className="sr-only">Open user menu</span>
								<Avatar
									src={user.avatarUrl}
									alt={user.fullName || user.email}
									fallback={user.email?.[0]?.toUpperCase()}
									className="h-9 w-9"
								/>
							</Menu.Button>
							<Transition
								as={Fragment}
								enter="transition ease-out duration-200"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-100 scale-100"
								leave="transition ease-in duration-75"
								leaveFrom="transform opacity-100 scale-100"
								leaveTo="transform opacity-0 scale-95"
							>
								<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="border-gray-100 border-b px-4 py-2">
										<p className="truncate font-medium text-gray-900 text-sm">
											{user.fullName || "User"}
										</p>
										<p className="truncate text-gray-500 text-xs">
											{user.email}
										</p>
									</div>

									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/profile"
													className={cn(
														active ? "bg-gray-50" : "",
														"block flex items-center gap-2 px-4 py-2 text-gray-700 text-sm",
													)}
												>
													<UserIcon className="h-4 w-4" />
													Your Profile
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/settings/profile"
													className={cn(
														active ? "bg-gray-50" : "",
														"block flex items-center gap-2 px-4 py-2 text-gray-700 text-sm",
													)}
												>
													<Settings className="h-4 w-4" />
													Settings
												</Link>
											)}
										</Menu.Item>
									</div>

									<div className="border-gray-100 border-t py-1">
										<Menu.Item>
											{({ active }) => (
												<Form action="/logout" method="post" className="w-full">
													<button
														type="submit"
														className={cn(
															active ? "bg-gray-50" : "",
															"block flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 text-sm",
														)}
													>
														<LogOut className="h-4 w-4" />
														Sign out
													</button>
												</Form>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
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
