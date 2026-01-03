import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigation,
} from "react-router";
import {
	createCategory,
	deleteCategory,
	getAdminCategories,
	updateCategory,
} from "../services/admin.categories.server";

interface Category {
	id: string;
	name: string;
	slug: string;
	icon: string;
	orderIndex: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const categories = await getAdminCategories();
	return { categories: categories as Category[] };
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");
	const id = formData.get("id") as string;
	const name = formData.get("name") as string;
	const slug = formData.get("slug") as string;
	const icon = formData.get("icon") as string;
	const orderIndex = Number(formData.get("orderIndex"));

	if (intent === "create") {
		await createCategory({ name, slug, icon, orderIndex });
	} else if (intent === "update") {
		await updateCategory(id, { name, slug, icon, orderIndex });
	} else if (intent === "delete") {
		await deleteCategory(id);
	}

	return { success: true };
}

export default function CategoriesPage() {
	const { categories } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openCreateModal = () => {
		setEditingCategory(null);
		setIsModalOpen(true);
	};

	const openEditModal = (category: Category) => {
		setEditingCategory(category);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingCategory(null);
	};

	return (
		<div className="p-responsive">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-2xl text-gray-900">
					Community Categories
				</h1>
				<button
					type="button"
					onClick={openCreateModal}
					className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-bold text-white hover:bg-primary-700"
				>
					<Plus className="h-5 w-5" />
					Add Category
				</button>
			</div>

			{/* List */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<table className="w-full text-left font-medium text-gray-600 text-sm">
					<thead className="bg-gray-50 text-gray-500 uppercase">
						<tr>
							<th className="px-responsive py-3">Order</th>
							<th className="px-responsive py-3">Icon</th>
							<th className="px-responsive py-3">Name</th>
							<th className="px-responsive py-3">Slug</th>
							<th className="px-responsive py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{categories.map((category) => (
							<tr key={category.id} className="hover:bg-gray-50/50">
								<td className="px-responsive py-4">{category.orderIndex}</td>
								<td className="px-responsive py-4">
									<div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-lg">
										{/* Just render text for now, assuming simple use. Future: Dynamic Icon */}
										{category.icon.startsWith("http") ? (
											<img
												src={category.icon}
												alt=""
												className="h-full w-full rounded object-cover"
											/>
										) : (
											<span>{category.icon}</span> // Emoji or Lucide name
										)}
									</div>
								</td>
								<td className="px-responsive py-4 font-bold text-gray-900">
									{category.name}
								</td>
								<td className="px-responsive py-4 font-mono text-gray-500 text-xs">
									{category.slug}
								</td>
								<td className="px-responsive py-4 text-right">
									<div className="flex justify-end gap-2">
										<button
											type="button"
											onClick={() => openEditModal(category)}
											className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
										>
											<Pencil className="h-4 w-4" />
										</button>
										<Form
											method="post"
											onSubmit={(e) => {
												if (
													!confirm(
														"Are you sure? This might break existing communities.",
													)
												) {
													e.preventDefault();
												}
											}}
											className="inline-block"
										>
											<input type="hidden" name="intent" value="delete" />
											<input type="hidden" name="id" value={category.id} />
											<button
												type="submit"
												className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</Form>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl bg-white p-responsive shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-bold text-lg">
								{editingCategory ? "Edit Category" : "New Category"}
							</h2>
							<button
								type="button"
								onClick={closeModal}
								className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<Form method="post" onSubmit={closeModal}>
							<input
								type="hidden"
								name="intent"
								value={editingCategory ? "update" : "create"}
							/>
							{editingCategory && (
								<input type="hidden" name="id" value={editingCategory.id} />
							)}

							<div className="space-y-4">
								<div>
									<label
										htmlFor="category-name"
										className="mb-1 block font-bold text-gray-700 text-sm"
									>
										Name
									</label>
									<input
										id="category-name"
										type="text"
										name="name"
										defaultValue={editingCategory?.name}
										required
										className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
									/>
								</div>
								<div>
									<label
										htmlFor="category-slug"
										className="mb-1 block font-bold text-gray-700 text-sm"
									>
										Slug
									</label>
									<input
										id="category-slug"
										type="text"
										name="slug"
										defaultValue={editingCategory?.slug}
										required
										className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
									/>
								</div>
								<div>
									<label
										htmlFor="category-icon"
										className="mb-1 block font-bold text-gray-700 text-sm"
									>
										Icon (Emoji or URL)
									</label>
									<input
										id="category-icon"
										type="text"
										name="icon"
										defaultValue={editingCategory?.icon}
										required
										placeholder="💻 or https://..."
										className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
									/>
								</div>
								<div>
									<label
										htmlFor="category-order"
										className="mb-1 block font-bold text-gray-700 text-sm"
									>
										Order Index
									</label>
									<input
										id="category-order"
										type="number"
										name="orderIndex"
										defaultValue={editingCategory?.orderIndex || 0}
										required
										className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
									/>
								</div>
							</div>

							<div className="mt-6 flex justify-end gap-3">
								<button
									type="button"
									onClick={closeModal}
									className="rounded-lg px-4 py-2 font-bold text-gray-600 hover:bg-gray-100"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-lg bg-primary-600 px-4 py-2 font-bold text-white hover:bg-primary-700 disabled:opacity-50"
								>
									{isSubmitting ? "Saving..." : "Save"}
								</button>
							</div>
						</Form>
					</div>
				</div>
			)}
		</div>
	);
}
