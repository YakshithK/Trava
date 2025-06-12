
import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const reportUser = async (
  reportedUserId: string, 
  reportingUser: SupabaseUser | null,
  reason?: string
) => {
  if (!reportingUser) return { error: "No user logged in" };

  const { error } = await supabase
    .from("user_reports")
    .insert({
      reported_user_id: reportedUserId,
      reporting_user_id: reportingUser.id,
      reason: reason || "Inappropriate behavior",
      created_at: new Date().toISOString()
    });

  return { error };
};

export const blockUser = async (
  blockedUserId: string, 
  blockingUser: SupabaseUser | null
) => {
  if (!blockingUser) return { error: "No user logged in" };

  const { error } = await supabase
    .from("user_blocks")
    .insert({
      blocked_user_id: blockedUserId,
      blocking_user_id: blockingUser.id,
      created_at: new Date().toISOString()
    });

  return { error };
};
