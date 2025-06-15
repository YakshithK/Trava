
import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const blockUser = async (
  blockedUserId: string, 
  blockingUser: SupabaseUser | null
) => {
  if (!blockingUser) return { error: "No user logged in" };

  const { error } = await supabase
    .from("blocks")
    .insert({
      blocked_id: blockedUserId,
      blocker_id: blockingUser.id,
      created_at: new Date().toISOString()
    });

  return { error };
};
