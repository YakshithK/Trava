import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { usePresenceStore } from "@/store/presenceStore";
import { useEffect } from "react";

export function usePresenceChannel() {
    const { user } = useAuth();
    const setOnlineUserIds = usePresenceStore((s) => s.setOnlineUserIds)
    const onlineUserIds = usePresenceStore((s) => s.onlineUserIds)

    console.log(onlineUserIds, 'lebron')

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel("presence:global", {
            config: { presence: {key: user.id}}
        })

            channel 
            .on("presence", { event: "sync" }, () => {
                console.log("lebron");
                const state = channel.presenceState();
                console.log("presence state:", state);
                const ids = Object.keys(state);
                console.log("hello", ids, "my user id:", user.id);
                setOnlineUserIds(ids);
            })
            .on('presence', { event: 'join' }, ({ key, leftPresences }) => {
                console.log('leave', key, leftPresences)
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