
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { usePresenceStore } from "@/store/presenceStore";
import { useEffect } from "react";

export function usePresenceChannel() {
    const { user } = useAuth();
    const setOnlineUserIds = usePresenceStore((s) => s.setOnlineUserIds)
    const onlineUserIds = usePresenceStore((s) => s.onlineUserIds)

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel("presence:global", {
            config: { presence: {key: user.id}}
        })

            channel 
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();

                const ids = Object.keys(state);
                setOnlineUserIds(ids);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({})
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, setOnlineUserIds])
}
