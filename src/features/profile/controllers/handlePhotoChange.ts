export const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setPhotoData: React.Dispatch<React.SetStateAction<string | null>>,
    ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB");
      e.target.value = ''; // Clear the file input
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      e.target.value = ''; // Clear the file input
      return;
    }
    
    // Check image dimensions
    const img = new Image();
    img.onload = () => {

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file");
        e.target.value = ''; // Clear the file input
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setError("Failed to load image. Please try another file.");
      e.target.value = ''; // Clear the file input
    };
    img.src = URL.createObjectURL(file);
  };