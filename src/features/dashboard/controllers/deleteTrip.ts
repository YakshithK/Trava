import { supabase } from "@/config/supabase";

export const deleteTrip = async (tripId: string, toast: (props: any) => void) => {
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);
  
      if (error) {
        throw new Error(error.message);
      }
  
      toast({
        title: "Trip Deleted",
        description: "Your trip has been successfully deleted.",
      });
  
      return true;
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    };