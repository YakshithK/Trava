import { supabase } from "@/config/supabase"
import {User as SupabaseUser} from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast";

export const handleReaction = async (messageId: string, 
    emoji: string,
    user: SupabaseUser
) => {
    try {
        const {data: existingReaction} = await supabase
            .from("message_reactions")
            .select()
            .eq("message_id", messageId)
            .eq("user_id", user.id)
            .eq("emoji", emoji)
            .single()

        if (existingReaction) {
            await supabase
                .from("message_reactions")
                .delete()
                .eq("id", existingReaction.id)
        } else {
            await supabase.from("message_reactions")
            .insert({
                message_id: messageId,
                user_id: user.id,
                emoji: emoji
            })
        }
    } catch (error) {
        console.error("Error handling reaction: ", error)
        toast({
            title: "Error",
            description: "Failed to add reaction. Please try again.",
            variant: "destructive"
        })
    }
}