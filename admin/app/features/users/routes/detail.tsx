
import { db } from "@itcom/db/client";
import { users, payments, mentoringSessions, profiles, mentors } from "@itcom/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Route } from "./+types/detail";
import { Form, redirect } from "react-router";
// import { Button } from "~/shared/components/ui/Button"; // Removed to fix build error

export function meta() {
	return [{ title: "User Detail - Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
    const userId = params.userId!;
    
    // Fetch User
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Response("User not found", { status: 404 });

    // Fetch Profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    // Fetch Mentor Status
    const [mentor] = await db.select().from(mentors).where(eq(mentors.userId, userId));

    // Fetch Payments
    const paymentList = await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));

    // Fetch Mentoring
    const sessionList = await db.query.mentoringSessions.findMany({
        where: eq(mentoringSessions.userId, userId),
        with: {
            mentor: true
        },
        orderBy: (sessions, { desc }) => [desc(sessions.createdAt)]
    });

    return { user, profile, mentor, paymentList, sessionList };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const userId = params.userId!;

    if (intent === "toggle_status") {
        const currentStatus = formData.get("current_status");
        const newStatus = currentStatus === "active" ? "suspended" : "active";
        
        await db.update(users)
            .set({ status: newStatus })
            .where(eq(users.id, userId));
    }

    if (intent === "promote_mentor") {
        // Create mentor record
        await db.insert(mentors).values({
            userId: userId,
            title: "New Mentor", // Default
            isApproved: "true"
        });
    }

    return null;
}

export default function UserDetail({ loaderData }: Route.ComponentProps) {
    const { user, profile, mentor, paymentList, sessionList } = loaderData;

	return (
		<div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <a href="/users" className="hover:underline">Users</a>
                    <span>/</span>
                    <span>{user.name}</span>
                </div>
			    <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <div className="flex gap-2">
                         {!mentor && (
                            <Form method="post">
                                <input type="hidden" name="intent" value="promote_mentor" />
                                <button 
                                    type="submit"
                                    className="px-4 py-2 rounded-lg font-medium text-white shadow-sm bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Promote to Mentor
                                </button>
                            </Form>
                        )}
                        <Form method="post">
                            <input type="hidden" name="intent" value="toggle_status" />
                            <input type="hidden" name="current_status" value={user.status || "active"} />
                            <button 
                                type="submit"
                                className={`px-4 py-2 rounded-lg font-medium text-white shadow-sm ${user.status === 'suspended' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {user.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                            </button>
                        </Form>
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-bold">Profile</h2>
                        {mentor && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">Mentor</span>}
                    </div>
                    
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{user.email}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd>{user.role}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd>{user.status || 'active'}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Job Family</dt><dd>{profile?.jobFamily || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Level</dt><dd>{profile?.level || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">City</dt><dd>{profile?.targetCity || '-'}</dd></div>
                    </dl>
                </div>

                {/* Payments */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4">Payment History</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Order ID</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentList.length === 0 && <tr><td colSpan={4} className="px-4 py-2 text-center text-gray-500">No payments found</td></tr>}
                                {paymentList.map(p => (
                                    <tr key={p.id} className="border-t">
                                        <td className="px-4 py-2">{p.orderId}</td>
                                        <td className="px-4 py-2">{Number(p.amount).toLocaleString()} {p.currency}</td>
                                        <td className="px-4 py-2">{p.status}</td>
                                        <td className="px-4 py-2">{new Date(p.createdAt!).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Mentoring */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-3">
                    <h2 className="text-lg font-bold mb-4">Mentoring Sessions</h2>
                    <div className="overflow-x-auto">
                         <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Mentor</th>
                                    <th className="px-4 py-2 text-left">Topic</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                 {sessionList.length === 0 && <tr><td colSpan={4} className="px-4 py-2 text-center text-gray-500">No sessions found</td></tr>}
                                {sessionList.map(s => (
                                    <tr key={s.id} className="border-t">
                                        <td className="px-4 py-2">{s.mentor?.name || 'Unknown'}</td>
                                        <td className="px-4 py-2">{s.topic}</td>
                                        <td className="px-4 py-2">{s.status}</td>
                                        <td className="px-4 py-2">{s.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
		</div>
	);
}
