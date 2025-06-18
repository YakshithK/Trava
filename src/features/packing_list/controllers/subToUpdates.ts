import { supabase } from "@/config/supabase";
import { fetchPackingList } from "../services/fetchPackingList";
import { PackingListType } from "../types";

export const subscribeToUpdates = (
  connectionId: string,
  packingList: PackingListType | null,
  setPackingList: (list: PackingListType | null) => void
) => {
  if (!packingList?.id) return () => {};

  const channel = supabase
    .channel(`packing_list:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'packing_list_items',
        filter: `packing_list_id=eq.${packingList.id}`
      },
      async (payload) => {
        try {
          await fetchPackingList(connectionId, setPackingList);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to packing list updates');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};