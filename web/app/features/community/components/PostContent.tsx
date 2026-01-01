import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
	content: string;
}

export function PostContent({ content }: PostContentProps) {
	return (
		<div className="prose prose-sm prose-orange max-w-none break-words text-gray-700">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
