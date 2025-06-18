import { supabase } from "@/config/supabase";
import React from "react";
import { ProfileFormValues, Toast } from "../types";

export const onSubmit = async (data: ProfileFormValues,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setSuccess: React.Dispatch<React.SetStateAction<string | null>>,
    photoData: string | null,
    phoneError: string | null,
    toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: any) => void }
    
) => {
    // Check for any validation errors before proceeding
    if (phoneError) {
      setError("Please fix the phone number format before saving");
      return;
    }

    // Validate age
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Please enter a valid age between 0 and 120");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please log in again.");
        console.error("No authenticated user found during update");
        return;
      }

      let photoUrl = null

      if (photoData) {
        const base64Data = photoData.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteArrays = []

        for (let offset = 0; offset < byteCharacters.length; offset += 512){
          const slice = byteCharacters.slice(offset, offset+512)
          const byteNumbers = new Array(slice.length)

          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
          }

          const byteArray = new Uint8Array(byteNumbers)
          byteArrays.push(byteArray)
        }

        const blob = new Blob(byteArrays, {type: 'image/jpeg'})
        const file = new File([blob], `${user.id}-profile.jpg`, {type: 'image/jpeg'})

        const {data: uploadData, error: uploadError} = await supabase.storage
          .from('profile-images')
          .upload(`${user.id}-profile.jpg`, file, {
            upsert: true,
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error("Error uploading photo: ", uploadError)
          setError("Failed to upload photo. Please try again.")
          return
        }

        const {data: {publicUrl}} = supabase.storage
          .from('profile-images')
          .getPublicUrl(`${user.id}-profile.jpg`)

        photoUrl = publicUrl
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          contact_number: data.phoneNumber,
          age: Number(data.age),
          photo: photoUrl,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error.message);
        setError(`Failed to update profile: ${error.message}`);
        return;
      }
      setSuccess("Your profile has been updated successfully!");
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Unexpected error during profile update:", error);
      setError(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
      
      toast({
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };