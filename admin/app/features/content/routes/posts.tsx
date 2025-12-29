
import { db } from "@itcom/db/client";
import { communityPosts, users } from "@itcom/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Route } from "./+types/posts";
import { Form } from "react-router";

export function meta() {
	return [{ title: "Content Moderation - Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    // Join posts with authors
    const posts = await db.select({
        id: communityPosts.id,
        title: communityPosts.title,
        category: communityPosts.category,
        createdAt: communityPosts.createdAt,
        authorName: users.name,
        authorEmail: users.email
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.authorId, users.id))
    .orderBy(desc(communityPosts.createdAt))
    .limit(50);
    
    return { posts };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const postId = formData.get("postId") as string;

    if (intent === "delete" && postId) {
        await db.delete(communityPosts).where(eq(communityPosts.id, postId));
    }

    return null;
}

export default function Posts({ loaderData }: Route.ComponentProps) {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8">
			    <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loaderData.posts.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No posts found</td></tr>
                        )}
                        {loaderData.posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {post.category}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{post.authorName}</div>
                                    <div className="text-xs text-gray-500">{post.authorEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(post.createdAt!).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Form method="post" onSubmit={(e) => !confirm("Are you sure?") && e.preventDefault()}>
                                        <input type="hidden" name="intent" value="delete" />
                                        <input type="hidden" name="postId" value={post.id} />
                                        <button type="submit" className="text-red-600 hover:text-red-900">Delete</button>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
		</div>
	);
}
