import { supabase } from "@/config/supabase";
import React from "react";
import { ProfileFormValues, Toast } from "./types";

export const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
  
    // Check if the number has more than 10 digits (i.e., has a country code)
    if (digitsOnly.length > 10) {
      const countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      const areaCode = digitsOnly.slice(-10, -7);
      const prefix = digitsOnly.slice(-7, -4);
      const lineNumber = digitsOnly.slice(-4);
      return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber}`;
    }
  
    // Fallback: assume US-style local number if exactly 10 digits
    const match = digitsOnly.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  
    // If none of the above match, return original
    return phone;
  };

export const fetchData = async (
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setUser: React.Dispatch<React.SetStateAction<any>>,
    form: any,
    setPhotoData: React.Dispatch<React.SetStateAction<string | null>>
) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching user profile data...");
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please log in again.");
        console.error("No authenticated user found");
        return;
      }
      setUser(user)

      const { data: userStats, error } = await supabase
        .from("users")
        .select("name, age, contact_number, photo, code")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        setError(`Failed to load profile data: ${error.message}`);
        return;
      }

      console.log("User profile data loaded successfully");
      
      form.reset({
        name: userStats.name || "",
        phoneNumber: userStats.contact_number || "",
        age: userStats.age ? String(userStats.age) : "",
        code: userStats.code || ""
      });

      setPhotoData(userStats.photo || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An unexpected error occurred while loading your profile.");
    } finally {
      setIsLoading(false);
    }
  };

export const handleForgotPassword = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setSuccess: React.Dispatch<React.SetStateAction<string | null>>,
    user: any
    ) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const {error} = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) {
        setError(`Failed to senpassword reset emailL ${error.message}`);
      } else {
        setSuccess(`Password reset email sent to to ${user.email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err.message || "Please try again. "}`);
    } finally {
      setIsLoading(false)
    }
  };

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
      console.log("Updating user profile...", data);
      
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

      console.log("Profile updated successfully");
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

const getTotalReferrals = async (userId) => {
  const {count: totalReferrals} = await supabase
    .from("referrals")
    .select("*", {count: "exact", head: true})
    .eq("referrer_id", userId)

  return totalReferrals
}

const getSuccessfulReferrals = async (userId) => {
  const {count: successfulReferrals} = await supabase
    .from("referrals")
    .select("*, users!inner(email_confirmed_at)", {count: "exact", head: true})
    .eq('referrer_id', userId)
    .not("users.email_confirmed_at", "is", null)

  return successfulReferrals
}

const getPendingReferrals = async (userId) => {
  const {data: referrals} = await supabase
    .from("referrals")
    .select("referred_id")
    .eq("referrer_id", userId)

  const referredIds = referrals.map(r => r.referred_id)

  const {count: pendingReferrals} = await supabase
    .from('referral_clicks')
    .select('*', {count: "exact", head: true})
    .eq("referrer_id", userId)
    .not("clicked_user_id", "in", referredIds)

  return pendingReferrals
}

export const getReferralStats = async (
  userId: string,
  setTotalReferrals: React.Dispatch<React.SetStateAction<number>>,
  setPendingReferrals: React.Dispatch<React.SetStateAction<number>>,
  setSuccessfulReferrals: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    // Get total clicks (how many times the referral link was clicked)
    const { data: clicksData, error: clicksError } = await supabase
      .from('referral_clicks')
      .select('id')
      .eq('referrer_id', userId);

    if (clicksError) throw clicksError;
    const totalClicks = clicksData?.length || 0;

    // Get successful referrals (users who actually signed up)
    const { data: referralsData, error: referralsError } = await supabase
      .from('referrals')
      .select('referred_id')
      .eq('referrer_id', userId);

    if (referralsError) throw referralsError;
    const successfulReferrals = referralsData?.length || 0;

    // Calculate pending referrals (clicks - successful signups)
    const pendingReferrals = totalClicks - successfulReferrals;

    setTotalReferrals(totalClicks);
    setSuccessfulReferrals(successfulReferrals);
    setPendingReferrals(pendingReferrals);

  } catch (error) {
    console.error('Error fetching referral stats:', error);
    setTotalReferrals(0);
    setPendingReferrals(0);
    setSuccessfulReferrals(0);
  }
};