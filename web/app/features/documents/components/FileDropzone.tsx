import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
	onFileSelect: (file: File | null) => void;
	currentFile: File | null;
}

export function FileDropzone({ onFileSelect, currentFile }: FileDropzoneProps) {
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (file) {
				// Simulate upload progress
				setIsUploading(true);
				setUploadProgress(0);

				const interval = setInterval(() => {
					setUploadProgress((prev) => {
						if (prev >= 100) {
							clearInterval(interval);
							setIsUploading(false);
							onFileSelect(file);
							return 100;
						}
						return prev + 10;
					});
				}, 100);
			}
		},
		[onFileSelect],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: 1,
		accept: {
			"application/pdf": [".pdf"],
			"application/msword": [".doc"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[".docx"],
		},
	});

	const removeFile = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileSelect(null);
		setUploadProgress(0);
	};

	return (
		<div className="w-full">
			<div
				{...getRootProps()}
				className={clsx(
					"relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all",
					isDragActive
						? "border-primary-500 bg-primary-50"
						: "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
					currentFile && "border-accent-500 bg-accent-50",
				)}
			>
				<input {...getInputProps()} />

				<AnimatePresence mode="wait">
					{!currentFile ? (
						<motion.div
							key="prompt"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center gap-2"
						>
							<div className="center mb-2 h-12 w-12 rounded-full bg-gray-100">
								<Upload className="h-6 w-6 text-gray-500" />
							</div>
							<p className="heading-5 text-sm">
								{isDragActive
									? "Drop the file here"
									: "Click or drag file to upload"}
							</p>
							<p className="caption">PDF, DOC, DOCX up to 10MB</p>
						</motion.div>
					) : (
						<motion.div
							key="file"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="flex w-full max-w-sm flex-col items-center"
						>
							<div className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
								<div className="center h-10 w-10 flex-shrink-0 rounded-lg bg-red-50">
									<FileText className="h-5 w-5 text-red-500" />
								</div>
								<div className="min-w-0 flex-1 text-left">
									<p className="heading-5 truncate text-sm">
										{currentFile.name}
									</p>
									<p className="caption">
										{(currentFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								{isUploading ? (
									<div className="center relative h-12 w-12">
										<svg
											className="h-full w-full -rotate-90 transform"
											aria-labelledby="progress-title"
										>
											<title id="progress-title">Upload Progress</title>
											<circle
												cx="24"
												cy="24"
												r="18"
												stroke="currentColor"
												strokeWidth="3"
												fill="transparent"
												className="text-gray-200"
											/>
											<circle
												cx="24"
												cy="24"
												r="18"
												stroke="currentColor"
												strokeWidth="3"
												fill="transparent"
												strokeDasharray={113}
												strokeDashoffset={113 - (113 * uploadProgress) / 100}
												className="text-accent-500 transition-all duration-300"
											/>
										</svg>
									</div>
								) : (
									<button
										type="button"
										onClick={removeFile}
										className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
									>
										<X className="h-5 w-5" />
									</button>
								)}
							</div>

							{!isUploading && (
								<motion.div
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									className="mt-2 flex items-center gap-1 font-medium text-accent-600 text-xs"
								>
									<CheckCircle className="h-3 w-3" />
									Upload Complete
								</motion.div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
