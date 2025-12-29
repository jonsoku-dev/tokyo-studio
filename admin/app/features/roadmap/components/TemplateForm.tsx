/**
 * Template Form Component
 * Used for both Create and Edit
 */
import {
	Field,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Switch,
} from "@headlessui/react";
import { Check, ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import { Form, Link, useFetcher } from "react-router";

interface TemplateFormProps {
	template?: {
		id: string;
		title: string;
		description: string;
		category: string;
		estimatedMinutes: number;
		priority: string;
		targetJobFamilies: string[] | null;
		targetLevels: string[] | null;
		targetJpLevels: string[] | null;
		targetCities: string[] | null;
		isActive: boolean;
	};
}

const categories = ["Learning", "Application", "Preparation", "Settlement"];
const priorities = ["urgent", "normal", "low"];
const jobFamilies = [
	"frontend",
	"backend",
	"fullstack",
	"mobile",
	"devops",
	"data",
];
const levels = ["junior", "mid", "senior", "lead"];
const jpLevels = ["N1", "N2", "N3", "N4", "N5", "None"];
const cities = ["Tokyo", "Osaka", "Nagoya", "Fukuoka", "Other"];

export function TemplateForm({ template }: TemplateFormProps) {
	// State for form fields controlled by Headless UI
	const [category, setCategory] = useState(template?.category || categories[0]);
	const [priority, setPriority] = useState(template?.priority || priorities[1]);
	const [isActive, setIsActive] = useState(template?.isActive ?? true);

	// Targeting State
	const [selectedJobFamilies, setSelectedJobFamilies] = useState<string[]>(
		template?.targetJobFamilies || [],
	);
	const [selectedLevels, setSelectedLevels] = useState<string[]>(
		template?.targetLevels || [],
	);
	const [selectedJpLevels, setSelectedJpLevels] = useState<string[]>(
		template?.targetJpLevels || [],
	);
	const [selectedCities, setSelectedCities] = useState<string[]>(
		template?.targetCities || [],
	);

	const previewFetcher = useFetcher();

	const handlePreview = () => {
		previewFetcher.submit(
			{
				intent: "preview",
				targetJobFamilies: JSON.stringify(selectedJobFamilies),
				targetLevels: JSON.stringify(selectedLevels),
				targetJpLevels: JSON.stringify(selectedJpLevels),
				targetCities: JSON.stringify(selectedCities),
			},
			{ method: "post", action: "/api/roadmap/preview-targeting" },
		);
	};

	return (
		<Form method="post" className="space-y-8">
			{/* Basic Info Section */}
			<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
					<h2 className="text-lg font-semibold text-gray-900">
						Basic Information
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						Define the core details of the task template.
					</p>
				</div>

				<div className="p-6 space-y-6">
					{/* Title */}
					<Field>
						<Label className="block text-sm font-medium text-gray-700 mb-1">
							Title
						</Label>
						<div className="relative">
							<input
								type="text"
								name="title"
								required
								defaultValue={template?.title}
								className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
								placeholder="e.g., Complete Resume Draft"
							/>
						</div>
					</Field>

					{/* Description */}
					<Field>
						<Label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</Label>
						<textarea
							name="description"
							required
							rows={3}
							defaultValue={template?.description}
							className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
							placeholder="Explain the task in detail..."
						/>
					</Field>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Category (Listbox) */}
						<Field>
							<Label className="block text-sm font-medium text-gray-700 mb-1">
								Category
							</Label>
							<input type="hidden" name="category" value={category} />
							<Listbox value={category} onChange={setCategory}>
								<div className="relative mt-1">
									<ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
										<span className="block truncate">{category}</span>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<ChevronDown
												className="h-4 w-4 text-gray-400"
												aria-hidden="true"
											/>
										</span>
									</ListboxButton>
									<ListboxOptions
										transition
										className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
									>
										{categories.map((cat) => (
											<ListboxOption
												key={cat}
												value={cat}
												className={({ focus }) =>
													`relative cursor-default select-none py-2 pl-10 pr-4 ${
														focus
															? "bg-indigo-100 text-indigo-900"
															: "text-gray-900"
													}`
												}
											>
												{({ selected }) => (
													<>
														<span
															className={`block truncate ${
																selected ? "font-medium" : "font-normal"
															}`}
														>
															{cat}
														</span>
														{selected ? (
															<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
																<Check className="h-4 w-4" aria-hidden="true" />
															</span>
														) : null}
													</>
												)}
											</ListboxOption>
										))}
									</ListboxOptions>
								</div>
							</Listbox>
						</Field>

						{/* Priority (Listbox) */}
						<Field>
							<Label className="block text-sm font-medium text-gray-700 mb-1">
								Priority
							</Label>
							<input type="hidden" name="priority" value={priority} />
							<Listbox value={priority} onChange={setPriority}>
								<div className="relative mt-1">
									<ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
										<span className="block truncate capitalize">
											{priority}
										</span>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<ChevronDown
												className="h-4 w-4 text-gray-400"
												aria-hidden="true"
											/>
										</span>
									</ListboxButton>
									<ListboxOptions
										transition
										className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
									>
										{priorities.map((p) => (
											<ListboxOption
												key={p}
												value={p}
												className={({ focus }) =>
													`relative cursor-default select-none py-2 pl-10 pr-4 ${
														focus
															? "bg-indigo-100 text-indigo-900"
															: "text-gray-900"
													}`
												}
											>
												{({ selected }) => (
													<>
														<span
															className={`block truncate capitalize ${
																selected ? "font-medium" : "font-normal"
															}`}
														>
															{p}
														</span>
														{selected ? (
															<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
																<Check className="h-4 w-4" aria-hidden="true" />
															</span>
														) : null}
													</>
												)}
											</ListboxOption>
										))}
									</ListboxOptions>
								</div>
							</Listbox>
						</Field>

						{/* Estimated Time */}
						<Field>
							<Label className="block text-sm font-medium text-gray-700 mb-1">
								Estimated (min)
							</Label>
							<input
								type="number"
								name="estimatedMinutes"
								width={100}
								min={1}
								defaultValue={template?.estimatedMinutes || 60}
								className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
							/>
						</Field>
					</div>

					{/* Active Toggle (Switch) */}
					<Field className="flex items-center justify-between">
						<span className="flex flex-col">
							<Label className="text-sm font-medium text-gray-900" passive>
								Active Status
							</Label>
							<span className="text-sm text-gray-500">
								If inactive, this template won't be assigned to new users.
							</span>
						</span>
						<Switch
							checked={isActive}
							onChange={setIsActive}
							className={`${
								isActive ? "bg-indigo-600" : "bg-gray-200"
							} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
						>
							<span
								className={`${
									isActive ? "translate-x-6" : "translate-x-1"
								} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
							/>
						</Switch>
						<input type="hidden" name="isActive" value={String(isActive)} />
					</Field>
				</div>
			</section>

			{/* Targeting Section */}
			<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-gray-900">
							Target Segments
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							Specify which user groups should receive this task.
						</p>
					</div>
					<button
						type="button"
						onClick={handlePreview}
						className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-xs font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
					>
						<Users className="w-3 h-3 mr-1.5" />
						Estimate Reach
					</button>
				</div>

				<div className="p-6 space-y-8">
					{/* Preview Feedback */}
					{previewFetcher.data && (
						<div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
							<div className="flex">
								<div className="flex-shrink-0">
									<Users className="h-5 w-5 text-blue-400" aria-hidden="true" />
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-blue-800">
										Audience Estimate
									</h3>
									<div className="mt-2 text-sm text-blue-700">
										<p>
											This configuration matches{" "}
											<strong>
												{(previewFetcher.data as { count: number }).count}
											</strong>{" "}
											users in the database.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Selectors */}
					<div className="space-y-6">
						<ChipGroup
							label="Job Families"
							items={jobFamilies}
							selected={selectedJobFamilies}
							onChange={setSelectedJobFamilies}
							name="targetJobFamilies"
						/>
						<ChipGroup
							label="Experience Levels"
							items={levels}
							selected={selectedLevels}
							onChange={setSelectedLevels}
							name="targetLevels"
						/>
						<ChipGroup
							label="Japanese Proficiency"
							items={jpLevels}
							selected={selectedJpLevels}
							onChange={setSelectedJpLevels}
							name="targetJpLevels"
						/>
						<ChipGroup
							label="Target Cities"
							items={cities}
							selected={selectedCities}
							onChange={setSelectedCities}
							name="targetCities"
						/>
					</div>
				</div>
			</section>

			{/* Form Actions */}
			<div className="flex items-center justify-end gap-4 pt-4">
				<Link
					to="/roadmap/templates"
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Cancel
				</Link>
				<button
					type="submit"
					className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
				>
					{template ? "Save Changes" : "Create Template"}
				</button>
			</div>
		</Form>
	);
}

// Helper Component for Chips
function ChipGroup({
	label,
	items,
	selected,
	onChange,
	name,
}: {
	label: string;
	items: string[];
	selected: string[];
	onChange: (items: string[]) => void;
	name: string;
}) {
	const toggle = (item: string) => {
		if (selected.includes(item)) {
			onChange(selected.filter((i) => i !== item));
		} else {
			onChange([...selected, item]);
		}
	};

	return (
		<div>
			<div className="block text-sm font-medium text-gray-700 mb-3">
				{label}
			</div>
			<div className="flex flex-wrap gap-2">
				{items.map((item) => {
					const isSelected = selected.includes(item);
					return (
						<button
							key={item}
							type="button"
							onClick={() => toggle(item)}
							className={`
                px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border
                ${
									isSelected
										? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200 ring-offset-1"
										: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
								}
              `}
						>
							{item}
						</button>
					);
				})}
			</div>
			<input type="hidden" name={name} value={JSON.stringify(selected)} />
		</div>
	);
}
