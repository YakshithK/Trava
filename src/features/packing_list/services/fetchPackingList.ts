import { supabase } from "@/config/supabase";

export const fetchPackingList = async (connectionId, setPackingList) => {
    const { data: list, error } = await supabase
      .from('packing_lists')
      .select('*, items:packing_list_items(*)')
      .eq('connection_id', connectionId)
      .single();

    if (error) {
      console.error('Error fetching packing list:', error);
      return;
    }

    setPackingList(list);
  };

