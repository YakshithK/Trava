import { supabase } from "@/config/supabase";

export const handleResendVerification = async (setIsResending: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setSuccess: React.Dispatch<React.SetStateAction<string | null>>,
    onboardingData: { email: string; phone: string; password: string; }
    ) => {  
    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {

      const {data, error: resendError} = await supabase.auth.signUp({
        email: onboardingData.email,
        phone: onboardingData.phone,
        password: onboardingData.password
      })
      
      if (resendError) {
        if (resendError.message.includes("User already registered")) {
          setSuccess("Verification email resent! Please check your inbox.");
        } else {
          setError("Failed to resend verification email: " + resendError.message);
        }
      } else {
        setSuccess("Verification email resent! Please check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };