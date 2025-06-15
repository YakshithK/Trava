import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const reportUser = async (
  reportedUserId: string, 
  reportingUser: SupabaseUser | null,
  reason?: string
) => {
  if (!reportingUser) return { error: "No user logged in" };

  const { error } = await supabase
    .from("reports")
    .insert({
      reported_id: reportedUserId,
      reporter_id: reportingUser.id,
      reason: reason || "Inappropriate behavior",
      created_at: new Date().toISOString()
    });

  return { error };
};