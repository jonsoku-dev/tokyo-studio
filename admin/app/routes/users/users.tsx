
import { db } from "~/shared/db/client.server";
import { users } from "~/shared/db/schema";
import { count, desc } from "drizzle-orm";
import type { Route } from "./+types/users";
import { Link } from "react-router";

export function meta() {
	return [{ title: "User Management - Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const userList = await db.select().from(users).orderBy(desc(users.createdAt)).limit(20);
    const total = await db.select({ count: count() }).from(users);
    
    return { users: userList, total: total[0].count };
}

export default function Users({ loaderData }: Route.ComponentProps) {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 flex justify-between items-center">
			    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <span className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    Total: <strong className="text-indigo-600">{loaderData.total}</strong>
                </span>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loaderData.users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                         <div className="h-10 w-10 flex-shrink-0">
                                            {user.avatarUrl ? (
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                         <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt!).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/users/${user.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
		</div>
	);
}
