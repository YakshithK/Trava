import { supabase } from "@/config/supabase";

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