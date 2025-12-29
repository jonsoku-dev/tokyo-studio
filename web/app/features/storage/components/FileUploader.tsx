import { AlertCircle, File as FileIcon, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "~/shared/utils/cn";
import {
	getUploadErrorMessage,
	getUploadErrorSuggestions,
	parseUploadError,
	type UploadError,
} from "../types/upload-errors";

interface FileUploaderProps {
	onUploadComplete: () => void;
}

interface UploadingFile {
	file: File;
	progress: number;
	error?: UploadError;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [globalError, setGlobalError] = useState<string | null>(null);

	const uploadFile = useCallback(
		async (file: File) => {
			setUploadingFiles((prev) => [...prev, { file, progress: 0 }]);
			setGlobalError(null);

			try {
				// 1. Get Presigned URL
				const presignedRes = await fetch(
					`/api/storage/presigned?filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}&size=${file.size}`,
				);

				if (!presignedRes.ok) {
					const errorData = await presignedRes.json();
					const uploadError = parseUploadError(
						new Error(errorData.error),
						errorData,
					);
					throw uploadError;
				}

				const { uploadUrl, key } = await presignedRes.json();

				// 2. Upload to Presigned URL
				// specific to our local implementation which uses FormData
				const formData = new FormData();
				formData.append("file", file);

				const xhr = new XMLHttpRequest();

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						setUploadingFiles((prev) =>
							prev.map((f) => (f.file === file ? { ...f, progress } : f)),
						);
					}
				};

				const uploadPromise = new Promise<void>((resolve, reject) => {
					xhr.onload = async () => {
						if (xhr.status >= 200 && xhr.status < 300) {
							resolve();
						} else {
							reject(new Error("Upload failed"));
						}
					};
					xhr.onerror = () => reject(new Error("Network error"));
				});

				xhr.open("POST", uploadUrl);
				xhr.send(formData);

				await uploadPromise;

				// 3. Finalize
				const finalizeFormData = new FormData();
				finalizeFormData.append("intent", "finalize");
				finalizeFormData.append("key", key);
				finalizeFormData.append("originalName", file.name);
				finalizeFormData.append("mimeType", file.type);
				finalizeFormData.append("size", file.size.toString());

				// Determine type based on extension or user input (defaulting to Resume for now)
				// In a fuller implementation, we might ask user to select type before upload
				// For now, let's map simple types or default to other
				let docType = "Other";
				if (file.name.toLowerCase().includes("resume")) docType = "Resume";
				else if (file.name.toLowerCase().includes("cv")) docType = "CV";
				else if (file.name.toLowerCase().includes("portfolio"))
					docType = "Portfolio";
				else if (file.name.toLowerCase().includes("cover"))
					docType = "Cover Letter";

				finalizeFormData.append("type", docType);

				const finalizeRes = await fetch("/api/storage/files", {
					method: "POST",
					body: finalizeFormData,
				});

				if (!finalizeRes.ok) {
					throw new Error("Failed to save file metadata");
				}

				// Remove from uploading list
				setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
				onUploadComplete();
			} catch (err) {
				console.error(err);
				const uploadError =
					err && typeof err === "object" && "type" in err
						? (err as UploadError)
						: parseUploadError(err);
				setUploadingFiles((prev) =>
					prev.map((f) => (f.file === file ? { ...f, error: uploadError } : f)),
				);
			}
		},
		[onUploadComplete],
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			acceptedFiles.forEach(uploadFile);
		},
		[uploadFile],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[".docx"],
			"text/plain": [".txt"],
		},
		maxSize: 10 * 1024 * 1024, // 10MB
		multiple: true,
	});

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
					isDragActive
						? "border-orange-500 bg-orange-50"
						: "border-gray-300 hover:border-orange-400 hover:bg-gray-50",
				)}
			>
				<input {...getInputProps()} />
				<UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
				<p className="mt-2 text-sm font-medium text-gray-900">
					Click to upload or drag and drop
				</p>
				<p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT up to 10MB</p>
			</div>

			{globalError && (
				<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
					{globalError}
				</div>
			)}

			{uploadingFiles.length > 0 && (
				<div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
					{uploadingFiles.map((item, idx) => (
						<div key={`${item.file.name}-${idx}`} className="p-4">
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center min-w-0">
									<FileIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
									<p className="text-sm font-medium text-gray-900 truncate">
										{item.file.name}
									</p>
								</div>
								<span className="text-xs text-gray-500 whitespace-nowrap ml-2">
									{item.error ? "Failed" : `${item.progress}%`}
								</span>
							</div>

							{item.error ? (
								<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex items-start gap-2">
										<AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-red-900">
												Upload Failed
											</p>
											<p className="text-xs text-red-700 mt-1">
												{getUploadErrorMessage(item.error)}
											</p>
											{getUploadErrorSuggestions(item.error) && (
												<p className="text-xs text-red-600 mt-2 font-medium">
													💡 {getUploadErrorSuggestions(item.error)}
												</p>
											)}
										</div>
									</div>
								</div>
							) : (
								<div className="w-full bg-gray-200 rounded-full h-1.5">
									<div
										className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
										style={{ width: `${item.progress}%` }}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
