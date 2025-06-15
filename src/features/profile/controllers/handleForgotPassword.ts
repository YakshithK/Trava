import { supabase } from "@/config/supabase";

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