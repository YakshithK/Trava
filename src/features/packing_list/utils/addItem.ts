import { supabase } from "@/config/supabase";
import { fetchPackingList } from "../services/fetchPackingList";
import { PackingListType } from "../types";

export const addItem = async (
  newItem: string,
  packingList: PackingListType | null,
  selectedCategory: string,
  setNewItem: (item: string) => void,
  connectionId: string,
  setPackingList: (list: PackingListType | null) => void
): Promise<void> => {
  if (!newItem.trim()) {
    throw new Error('Item name cannot be empty');
  }

  if (!packingList?.id) {
    throw new Error('Packing list not found');
  }

  if (selectedCategory === 'all') {
    throw new Error('Please select a category');
  }

  const { error } = await supabase
    .from('packing_list_items')
    .insert({
      packing_list_id: packingList.id,
      item_name: newItem.trim(),
      category: selectedCategory,
      is_checked: false
    });

  if (error) {
    console.error('Error adding item:', error);
    throw new Error('Failed to add item to packing list');
  }

  setNewItem('');
  await fetchPackingList(connectionId, setPackingList);
};