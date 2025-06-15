export const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>,
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadedFile(file);
      }
    };