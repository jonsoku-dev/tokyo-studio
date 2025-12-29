import { X } from "lucide-react";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";

interface DocumentPreviewProps {
	isOpen: boolean;
	onClose: () => void;
	document: {
		title: string;
		url: string | null;
	} | null;
}

export function DocumentPreview({
	isOpen,
	onClose,
	document,
}: DocumentPreviewProps) {
	if (!document?.url) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="p-4 border-b border-gray-200 flex items-center justify-between m-0">
					<DialogTitle>{document.title}</DialogTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="rounded-full h-8 w-8 p-0"
					>
						<X className="h-5 w-5" />
					</Button>
				</DialogHeader>

				<div className="flex-1 bg-gray-100 relative">
					<iframe
						src={document.url}
						className="w-full h-full border-none"
						title={document.title}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
