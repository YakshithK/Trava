import { RealtimeChannel } from "@supabase/supabase-js"
import { User as SupabaseUser } from '@supabase/supabase-js';

export const handleTyping = (typingChannel : React.MutableRefObject<RealtimeChannel | null>, user: SupabaseUser | null) => {
    if (!typingChannel.current || !user) return
    typingChannel.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: user.id,
        name: user.user_metadata?.name || "User",
      },
    })
  }