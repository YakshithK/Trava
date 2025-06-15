import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { supabase } from "@/config/supabase";
import { toast } from "@/components/ui/use-toast";

interface ImageUploadProps {
    onImageUpload: (imageUrl: string) => void;
    disabled?: boolean;
    onImageSelect?: (imageUrl: string) => void;
    resetTrigger?: number;
}

export const ImageUpload = ({ onImageUpload, disabled, onImageSelect, resetTrigger = 0 }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

    useEffect(() => {
        setPreview(null);
        setUploadedImageUrl(null);
        setIsUploading(false);
    }, [resetTrigger]);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please select a valid image file",
                variant: "destructive",
            });
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image size must be less than 5MB",
                variant: "destructive",
            });
            return   
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = fileName

            const {error: uploadError, data} = await supabase.storage
                .from('chat-images')
                .upload(filePath, file)

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }
            console.log("Upload successful:", data);

            const { data: {publicUrl}} = supabase.storage
                .from('chat-images')
                .getPublicUrl(filePath)
                
            console.log("Public URL:", publicUrl);
            setUploadedImageUrl(publicUrl);
            onImageSelect?.(publicUrl);
        } catch (error) {
            console.error("Error uploading image:", error)
            toast({
                title: "Upload failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveImage = () => {
        setPreview(null);
        setUploadedImageUrl(null);
    }

    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={disabled || isUploading}
            />
            <label htmlFor="image-upload">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled || isUploading}
                    className="relative"
                    onClick={() => {
                        console.log("Button clicked");
                        document.getElementById('image-upload')?.click();
                    }}
                >
                    <ImageIcon className="h-5 w-5" />
                </Button>
            </label>

            {preview && (
                <div className="absolute bottom-full mb-2 left-0">
                    <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-w-[200px] max-h-[200px] rounded-lg"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                    </div>
                </div> 
            )}
        </div>
    )
}