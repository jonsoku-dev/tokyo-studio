import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { useFetcher } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";

// If Slider doesn't exist, I'll use native input range for now to avoid blocking.
// Actually, let's just use native input range for zoom to be safe.

interface AvatarUploadProps {
	currentAvatarUrl?: string | null;
	userName: string;
}

export function AvatarUpload({
	currentAvatarUrl,
	userName,
}: AvatarUploadProps) {
	const fetcher = useFetcher();
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const onCropComplete = useCallback(
		(_croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles && acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			const reader = new FileReader();
			reader.addEventListener("load", () => {
				setImageSrc(reader.result as string);
				setIsDialogOpen(true);
			});
			reader.readAsDataURL(file);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/jpeg": [],
			"image/png": [],
			"image/webp": [],
		},
		maxFiles: 1,
		maxSize: 5 * 1024 * 1024, // 5MB
	});

	const createImage = (url: string): Promise<HTMLImageElement> =>
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", (error) => reject(error));
			image.setAttribute("crossOrigin", "anonymous");
			image.src = url;
		});

	async function getCroppedImg(
		imageSrc: string,
		pixelCrop: Area,
	): Promise<Blob> {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("No 2d context");
		}

		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			pixelCrop.width,
			pixelCrop.height,
		);

		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error("Canvas is empty"));
					return;
				}
				resolve(blob);
			}, "image/webp");
		});
	}

	const handleSave = async () => {
		if (!imageSrc || !croppedAreaPixels) return;

		try {
			const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
			const formData = new FormData();
			formData.append("file", croppedImageBlob, "avatar.webp");

			fetcher.submit(formData, {
				method: "post",
				action: "/api/users/me/avatar",
				encType: "multipart/form-data",
			});

			setIsDialogOpen(false);
			setImageSrc(null);
		} catch (e) {
			console.error(e);
		}
	};

	const handleDelete = () => {
		if (confirm("Are you sure you want to delete your avatar?")) {
			fetcher.submit(null, {
				method: "delete",
				action: "/api/users/me/avatar",
			});
		}
	};

	const isUploading = fetcher.state === "submitting";

	return (
		<div className="flex flex-col items-center gap-4">
			<div
				{...getRootProps()}
				className={`relative w-32 h-32 rounded-full overflow-hidden border-2 cursor-pointer transition-colors ${
					isDragActive
						? "border-primary-500 bg-primary-50"
						: "border-gray-200 hover:border-gray-300"
				}`}
			>
				<input {...getInputProps()} />
				{currentAvatarUrl ? (
					<img
						src={currentAvatarUrl}
						alt="Avatar"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-gray-100 center text-gray-400 heading-4">
						{userName.slice(0, 2).toUpperCase()}
					</div>
				)}
				<div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity center text-white text-xs font-medium">
					Change
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => open()} // open from dropzone
					disabled={isUploading}
				>
					Upload
				</Button>
				{currentAvatarUrl && (
					<Button
						variant="ghost"
						size="sm"
						className="text-red-500 hover:text-red-600 hover:bg-red-50"
						onClick={(e) => {
							e.stopPropagation();
							handleDelete();
						}}
						disabled={isUploading}
					>
						Remove
					</Button>
				)}
			</div>

			{fetcher.data?.error && (
				<p className="text-red-500 text-sm">{fetcher.data.error}</p>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Adjust Avatar</DialogTitle>
					</DialogHeader>
					<div className="stack-md">
						<div className="relative w-full h-[300px] bg-black/5 rounded-md overflow-hidden">
							{imageSrc && (
								<Cropper
									image={imageSrc}
									crop={crop}
									zoom={zoom}
									aspect={1}
									onCropChange={setCrop}
									onCropComplete={onCropComplete}
									onZoomChange={setZoom}
									cropShape="round"
									showGrid={false}
								/>
							)}
						</div>

						<div className="flex items-center gap-2">
							<span className="caption">Zoom</span>
							<input
								type="range"
								value={zoom}
								min={1}
								max={3}
								step={0.1}
								aria-labelledby="Zoom"
								onChange={(e) => setZoom(Number(e.target.value))}
								className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isUploading}>
								{isUploading ? "Saving..." : "Save Avatar"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
