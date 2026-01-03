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
			<DialogContent className="flex h-[85vh] max-w-5xl flex-col overflow-hidden p-0">
				<DialogHeader className="m-0 flex items-center justify-between border-gray-200 border-b p-responsive">
					<DialogTitle>{document.title}</DialogTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-8 w-8 rounded-full p-0"
					>
						<X className="h-5 w-5" />
					</Button>
				</DialogHeader>

				<div className="relative flex-1 bg-gray-100">
					<iframe
						src={document.url}
						className="h-full w-full border-none"
						title={document.title}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
