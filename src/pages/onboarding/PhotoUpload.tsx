import { Camera, User } from "lucide-react";

export const PhotoUpload = ({
    text,
    handleFileChange,
    photoPreview,
    setPhotoPreview,
}) => (
    <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
            {photoPreview ? (
            <img
                src={photoPreview}
                alt="Profile preview"
                className="w-full h-full rounded-full object-cover border-4 border-saath-saffron"
            />
            ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-saath-light-gray">
                <User className="w-16 h-16 text-gray-400" />
            </div>
            )}
        </div>
        <label
            htmlFor="photo-upload"
            className="cursor-pointer flex items-center gap-2 bg-saath-saffron hover:bg-saath-saffron/90 text-black rounded-full px-6 py-3"
        >
            <Camera className="h-5 w-5" />
            <span>{text.photoButton}</span>
        </label>
        <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(
            e,
            setPhotoPreview,
            )}
            className="hidden"
        />
    </div>
)