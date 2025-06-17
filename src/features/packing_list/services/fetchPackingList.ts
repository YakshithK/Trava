
import { supabase } from "@/config/supabase";

export const fetchPackingList = async (connectionId, setPackingList) => {
    // First try to get existing packing list
    let { data: list, error } = await supabase
      .from('packing_lists')
      .select('*, items:packing_list_items(*)')
      .eq('connection_id', connectionId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No packing list exists, create one
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user');
        return;
      }

      const { data: newList, error: createError } = await supabase
        .from('packing_lists')
        .insert({
          connection_id: connectionId,
          created_by: user.user.id,
          title: 'Shared Packing List'
        })
        .select('*, items:packing_list_items(*)')
        .single();

      if (createError) {
        console.error('Error creating packing list:', createError);
        return;
      }

      list = newList;
    } else if (error) {
      console.error('Error fetching packing list:', error);
      return;
    }

    setPackingList(list);
  };
