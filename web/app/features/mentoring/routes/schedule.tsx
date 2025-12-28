
import { requireUserId } from "../../auth/utils/session.server";
import { mentorService } from "../domain/mentor.service.server";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/schedule";
import { CheckCircle } from "lucide-react";

export function meta() {
	return [{ title: "Mentor Schedule - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);
    const mentor = await mentorService.getMentorByUserId(userId);
    
    if (!mentor) {
        throw new Response("Not Authorized: Mentor Profile Required", { status: 403 });
    }

    const availability = await mentorService.getAvailability(mentor.id);
    return { mentor, availability };
}

export async function action({ request }: Route.ActionArgs) {
    const userId = await requireUserId(request);
    const mentor = await mentorService.getMentorByUserId(userId);
    if (!mentor) throw new Response("Unauthorized", { status: 403 });

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "add_slot") {
        const day = formData.get("day") as string;
        const start = formData.get("start") as string;
        const end = formData.get("end") as string;
        
        await mentorService.updateAvailability(mentor.id, day, start, end);
    }

    return null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MentorSchedule({ loaderData }: Route.ComponentProps) {
    const { mentor, availability } = loaderData;
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <Shell>
            <div className="max-w-4xl mx-auto py-12">
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold mb-2">Availability Scheduler</h1>
                    <p className="text-gray-600">Manage your weekly schedule for mentoring sessions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                        <h2 className="text-lg font-bold mb-4">Add New Slot</h2>
                        <Form method="post" className="space-y-4">
                            <input type="hidden" name="intent" value="add_slot" />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                <select name="day" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                    {DAYS.map((d, i) => <option key={i} value={String(i)}>{d}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input type="time" name="start" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input type="time" name="end" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Adding..." : "Add Slot"}
                            </Button>
                        </Form>
                    </div>

                    {/* List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4">Current Availability</h2>
                        {availability.length === 0 ? (
                            <p className="text-gray-500 text-sm">No slots configured.</p>
                        ) : (
                            <ul className="space-y-3">
                                {availability.map(slot => (
                                    <li key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <div>
                                                <span className="font-medium block">{DAYS[Number(slot.dayOfWeek)]}</span>
                                                <span className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
}
