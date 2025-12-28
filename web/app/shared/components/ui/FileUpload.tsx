
import { useState } from "react";
import { Button } from "./Button";
import { UploadCloud, CheckCircle, XCircle } from "lucide-react";

interface FileUploadProps {
    label?: string;
    accept?: string;
    onUploadComplete: (url: string) => void;
    onError?: (error: Error) => void;
}

export function FileUpload({ label = "Upload File", accept = "image/*", onUploadComplete, onError }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // Mock progress or implemented if using XHR
    const [publicUrl, setPublicUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setPublicUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        
        try {
            // 1. Get Presigned URL
            const res = await fetch(`/api/storage/presigned?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
            if (!res.ok) throw new Error("Failed to get presigned URL");
            
            const { uploadUrl, publicUrl } = await res.json();

            // 2. Upload to S3
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            });

            if (!uploadRes.ok) throw new Error("Failed to upload to storage");

            setPublicUrl(publicUrl);
            onUploadComplete(publicUrl);
        } catch (error: any) {
            console.error(error);
            if (onError) onError(error);
            else alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            
            <div className="flex items-center gap-4">
                <div className="relative border-dashed border-2 border-gray-300 rounded-lg p-4 w-full text-center hover:bg-gray-50 transition">
                    <input 
                        type="file" 
                        accept={accept}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <span className="text-sm">{file ? file.name : "Click to select file"}</span>
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
                    <CheckCircle className="w-4 h-4" />
                    <span>Upload Complete</span>
                </div>
            )}
        </div>
    );
}
