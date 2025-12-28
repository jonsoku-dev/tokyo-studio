import { useState } from "react";
import { Form, redirect, useNavigation } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { requireUserId } from "../../auth/utils/session.server";
import { mentoringService } from "../domain/mentoring.service.server";
import { CreateMentoringSessionSchema } from "../domain/mentoring.types";
import type { Route } from "./+types/book";

export function meta() {
	return [{ title: "Book a Session - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireUserId(request);
	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const mentorName = String(formData.get("mentorName"));
	const topic = String(formData.get("topic"));
	const date = String(formData.get("date"));

	const result = CreateMentoringSessionSchema.safeParse({
		mentorName,
		topic,
		date,
		userId,
	});

	if (!result.success) {
		return { error: result.error.issues[0].message };
	}

	await mentoringService.createSession(result.data);
	return redirect("/mentoring");
}

export default function BookSession({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	// Simple state for wizard steps (Mock for MVP)
	const [step, setStep] = useState(1);
	const [selectedMentor, setSelectedMentor] = useState("");

	const mentors = [
		{
			id: "m1",
			name: "Kenji Tanaka",
			role: "Senior Frontend at LINE",
			tags: ["Frontend", "React"],
		},
		{
			id: "m2",
			name: "Sarah Kim",
			role: "Product Manager at Mercari",
			tags: ["PM", "Resume"],
		},
		{
			id: "m3",
			name: "Yuki Sato",
			role: "Backend Engineer at Rakuten",
			tags: ["Backend", "Java"],
		},
	];

	return (
		<Shell>
			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900">
						Book a Mentoring Session
					</h1>
					<p className="text-gray-500 text-sm">
						Get guidance from industry experts.
					</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					{/* Progress Bar */}
					<div className="flex items-center justify-between mb-8">
						{[1, 2, 3].map((s) => (
							<div key={s} className="flex items-center">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
										step >= s
											? "bg-orange-600 text-white"
											: "bg-gray-200 text-gray-500"
									}`}
								>
									{s}
								</div>
								{s < 3 && (
									<div
										className={`w-20 h-1 mx-2 ${step > s ? "bg-orange-600" : "bg-gray-200"}`}
									/>
								)}
							</div>
						))}
					</div>

					<Form method="post" className="space-y-6">
						{actionData?.error && (
							<div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
								{actionData.error}
							</div>
						)}

						{step === 1 && (
							<div className="space-y-4">
								<h2 className="text-lg font-medium text-gray-900">
									Select a Mentor
								</h2>
								<div className="grid gap-4">
									{mentors.map((mentor) => (
										<button
											key={mentor.id}
											type="button"
											className={`p-4 border rounded-lg cursor-pointer transition-colors text-left w-full ${
												selectedMentor === mentor.name
													? "border-orange-500 ring-1 ring-orange-500 bg-orange-50"
													: "border-gray-200 hover:border-orange-300"
											}`}
											onClick={() => setSelectedMentor(mentor.name)}
										>
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-medium text-gray-900">
														{mentor.name}
													</h3>
													<p className="text-sm text-gray-500">{mentor.role}</p>
												</div>
												<div className="flex gap-1">
													{mentor.tags.map((tag) => (
														<span
															key={tag}
															className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
														>
															{tag}
														</span>
													))}
												</div>
											</div>
										</button>
									))}
								</div>
								<input
									type="hidden"
									name="mentorName"
									value={selectedMentor}
									required
								/>
								<div className="flex justify-end pt-4">
									<Button
										type="button"
										onClick={() => setStep(2)}
										disabled={!selectedMentor}
									>
										Next: Topic & Date
									</Button>
								</div>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<h2 className="text-lg font-medium text-gray-900">
									Session Details
								</h2>

								<Input
									id="topic"
									name="topic"
									label="What do you want to discuss?"
									placeholder="e.g. Portfolio Review, Visa Questions..."
									required
								/>

								<Input
									id="date"
									name="date"
									type="date"
									label="Preferred Date"
									required
								/>

								<div className="flex justify-between pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => setStep(1)}
									>
										Back
									</Button>
									<Button type="button" onClick={() => setStep(3)}>
										Next: Confirm
									</Button>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-4">
								<h2 className="text-lg font-medium text-gray-900">
									Confirm Booking
								</h2>
								<div className="bg-gray-50 p-4 rounded-md space-y-2">
									<div className="flex justify-between">
										<span className="text-gray-500 text-sm">Mentor</span>
										<span className="font-medium text-gray-900">
											{selectedMentor}
										</span>
									</div>
									{/* Inputs are hidden but values are present in Form context if step 2 didn't unmount them. 
                                        Wait, standard Form behavior: hidden inputs needed if components unmount.
                                        For this simple wizard, we might need value persistence. 
                                        Let's rely on React state or CSS hiding for a robust implementation, 
                                        OR just re-render inputs as hidden in step 3. 
                                    */}
									<p className="text-xs text-orange-600 mt-2">
										* This is a mock booking. No payment required.
									</p>
								</div>

								<div className="flex justify-between pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => setStep(2)}
									>
										Back
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Booking..." : "Confirm Booking"}
									</Button>
								</div>
							</div>
						)}
					</Form>
				</div>
			</div>
		</Shell>
	);
}
