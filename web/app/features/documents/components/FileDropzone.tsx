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
					"relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] gap-3 text-center",
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
							<div className="w-12 h-12 rounded-full bg-gray-100 center mb-2">
								<Upload className="w-6 h-6 text-gray-500" />
							</div>
							<p className="text-sm heading-5">
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
							className="flex flex-col items-center w-full max-w-sm"
						>
							<div className="flex items-center gap-3 w-full bg-white p-3 rounded-lg shadow-sm border border-gray-200">
								<div className="w-10 h-10 rounded-lg bg-red-50 center flex-shrink-0">
									<FileText className="w-5 h-5 text-red-500" />
								</div>
								<div className="flex-1 text-left min-w-0">
									<p className="text-sm heading-5 truncate">
										{currentFile.name}
									</p>
									<p className="caption">
										{(currentFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								{isUploading ? (
									<div className="w-12 h-12 center relative">
										<svg
											className="w-full h-full transform -rotate-90"
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
										className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
									>
										<X className="w-5 h-5" />
									</button>
								)}
							</div>

							{!isUploading && (
								<motion.div
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									className="flex items-center gap-1 mt-2 text-accent-600 text-xs font-medium"
								>
									<CheckCircle className="w-3 h-3" />
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
