import { supabase } from "@/config/supabase";
import { generateReferralCode } from "@/lib/utils";
import { validateEmail, validatePhoneNumber, validatePassword, validateConfirmPassword } from "@/lib/validation";
import { NavigateFunction } from "react-router-dom";

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

export const handleSubmit = async (e: React.FormEvent,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    email: string,
    contactNumber: string,
    password: string,
    confirmPassword: string,
    name: string,
    age: string,
    photoFile: File | null,
    setEmailError: React.Dispatch<React.SetStateAction<string | null>>,
    setPhoneError: React.Dispatch<React.SetStateAction<string | null>>,
    setPasswordError: React.Dispatch<React.SetStateAction<string | null>>,
    setConfirmPasswordError: React.Dispatch<React.SetStateAction<string | null>>,
    navigate: NavigateFunction,
) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate all fields
    const emailValidationError = validateEmail(email);
    const phoneValidationError = validatePhoneNumber(contactNumber);
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);
    
    // Set all errors
    setEmailError(emailValidationError);
    setPhoneError(phoneValidationError);
    setPasswordError(passwordValidationError);
    setConfirmPasswordError(confirmPasswordValidationError);

    const refCode = localStorage.getItem("referral_code")

    // Check if there are any validation errors
    if (emailValidationError || phoneValidationError || 
        passwordValidationError || confirmPasswordValidationError) {
      setIsLoading(false);
      setError("Please fix all validation errors before creating your account");
      return;
    }

    // Validate name and age
    if (!name.trim()) {
      setIsLoading(false);
      setError("Please enter your name");
      return;
    }

    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setIsLoading(false);
      setError("Please enter a valid age between 0 and 120");
      return;
    }
    
    try {
      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        phone: contactNumber,
        password,
      });

      if (signUpError) {
        console.error("Error signing up:", signUpError);
        setError("Failed to create account. Please try again.");
        return;
      }

      if (!data.user) {
        console.error("No user data received after signup");
        setError("Failed to create account. Please try again.");
        return;
      }

      let photoUrl = null

      if (photoFile) {
        const {data: uploadData, error: uploadError} = await supabase.storage
          .from("profile-images")
          .upload(`${data.user.id}-profile.jpg`, photoFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error("Error uploading photo: ", uploadError)
          setError("Failed to upload profile photo. Please try again.")
          return
        }

        const {data: {publicUrl}} = supabase.storage
          .from('profile-images')
          .getPublicUrl(`${data.user.id}-profile.jpg`)

        photoUrl = publicUrl
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        name,
        age: parseInt(age),
        contact_number: contactNumber,
        email,
        photo: photoUrl,
        code: generateReferralCode()
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        setError("Failed to save profile information. Please try again.");
        return;
      }

      console.log(refCode)

      if (refCode) {
        const { data: referrer, error: referrerError } = await supabase.from("users")
          .select("id")
          .eq("code", refCode)
          .single();
        
        if (referrerError) {
          console.log("Error getting referrer data: ", referrerError)
          setError("Failed to get referrer information. Please try again.");
          return
        }

        const {error: referError} = await supabase.from("referrals")
          .insert({
            referrer_id: referrer.id,
            referred_id: data.user.id,
        })

        if (referError) {     
          console.log("Error inserting refer data: ", referrerError)
          setError("Failed to insert refer information. Please try again.");
          return
        } 
      }
      localStorage.setItem("onboardingData", JSON.stringify({
        email,
        phone: contactNumber,
        password
      }))
      navigate("/verify");
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };