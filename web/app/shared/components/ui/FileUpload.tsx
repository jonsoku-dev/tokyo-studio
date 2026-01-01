import { CheckCircle, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";

interface FileUploadProps {
	label?: string;
	accept?: string;
	onUploadComplete: (url: string) => void;
	onError?: (error: Error) => void;
}

export function FileUpload({
	label = "Upload File",
	accept = "image/*",
	onUploadComplete,
	onError,
}: FileUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [_progress, _setProgress] = useState(0); // Mock progress or implemented if using XHR
	const [publicUrl, setPublicUrl] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setFile(e.target.files[0]);
			setPublicUrl(null);
		}
	};

	const handleUpload = async () => {
		if (!file) return;
		setUploading(true);

		try {
			// 1. Get Presigned URL
			const res = await fetch(
				`/api/storage/presigned?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
			);
			if (!res.ok) throw new Error("Failed to get presigned URL");

			const { uploadUrl, publicUrl } = await res.json();

			// 2. Upload to S3
			const uploadRes = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!uploadRes.ok) throw new Error("Failed to upload to storage");

			setPublicUrl(publicUrl);
			onUploadComplete(publicUrl);
		} catch (error: unknown) {
			console.error(error);
			if (onError)
				onError(error instanceof Error ? error : new Error(String(error)));
			else
				alert(
					`Upload failed: ${error instanceof Error ? error.message : String(error)}`,
				);
		} finally {
			setUploading(false);
		}
	};

	const inputId = `file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`;
	return (
		<div className="space-y-4">
			<label
				htmlFor={inputId}
				className="block font-medium text-gray-700 text-sm"
			>
				{label}
			</label>

			<div className="flex items-center gap-4">
				<div className="relative w-full rounded-lg border-2 border-gray-300 border-dashed p-4 text-center transition hover:bg-gray-50">
					<input
						id={inputId}
						type="file"
						accept={accept}
						onChange={handleFileChange}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						disabled={uploading}
					/>
					<div className="flex flex-col items-center justify-center text-gray-500">
						<UploadCloud className="mb-2 h-8 w-8" />
						<span className="text-sm">
							{file ? file.name : "Click to select file"}
						</span>
					</div>
				</div>
			</div>

			{file && !publicUrl && (
				<Button onClick={handleUpload} disabled={uploading}>
					{uploading ? "Uploading..." : "Upload Now"}
				</Button>
			)}

			{publicUrl && (
				<div className="flex items-center gap-2 text-green-600 text-sm">
					<CheckCircle className="h-4 w-4" />
					<span>Upload Complete</span>
				</div>
			)}
		</div>
	);
}
