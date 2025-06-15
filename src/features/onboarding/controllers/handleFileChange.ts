export const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setPhotoPreview: React.Dispatch<React.SetStateAction<string>>,
    setPhotoFile: React.Dispatch<React.SetStateAction<File | null>> // Add this to store the file
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file); // Store the file for later upload
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setPhotoPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };