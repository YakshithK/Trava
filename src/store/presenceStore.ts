import { create } from "zustand"

type PresenceState = {
    onlineUserIds: string[]
    setOnlineUserIds: (ids: string[]) => void
    addOnlineUser: (id: string) => void
    removeOnlineUser: (id: string) => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
    onlineUserIds: [],
    setOnlineUserIds: (ids) => set({ onlineUserIds: ids}),
    addOnlineUser: (id) => set((state) => ({
        onlineUserIds: state.onlineUserIds.includes(id)
        ? state.onlineUserIds
        : [...state.onlineUserIds, id]
    })),
    removeOnlineUser: (id) => set((state) => ({
        onlineUserIds: state.onlineUserIds.filter((uid) => uid !== id)
    }))
}))