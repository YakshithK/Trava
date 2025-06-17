import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Luggage, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { fetchPackingList } from '../services/fetchPackingList';
import { subscribeToUpdates } from '../controllers/subToUpdates';
import { addItem } from '../utils/addItem';
import { PackingListItem, PackingListType } from '../types';
import { useToast } from '@/hooks/use-toast';

export function PackingList({ connectionId }: { connectionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [packingList, setPackingList] = useState<PackingListType | null>(null);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Clothing',
    'Toiletries',
    'Electronics',
    'Documents',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchPackingList(connectionId, setPackingList)
        .catch((error) => {
          console.error('Error fetching packing list:', error);
          toast({
            title: "Error",
            description: "Failed to load packing list. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
      
      const unsubscribe = subscribeToUpdates(connectionId, packingList, setPackingList);
      return () => unsubscribe();
    }
  }, [isOpen, connectionId]);

  const toggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      const { error } = await supabase
        .from('packing_list_items')
        .update({ is_checked: isChecked })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !packingList) return;
    
    setIsAddingItem(true);
    try {
      await addItem(newItem, packingList, selectedCategory, setNewItem, connectionId, setPackingList);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const filteredItems = packingList?.items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="rounded-full"
      >
        <Luggage className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Packing List</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredItems?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found. Add some items to get started!
                  </div>
                ) : (
                  filteredItems?.map(item => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={Boolean(item.is_checked)}
                          onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        />
                        <span className={item.is_checked ? 'line-through text-muted-foreground' : ''}>
                          {item.item_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="flex-1"
                disabled={isAddingItem}
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isAddingItem}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Button 
                onClick={handleAddItem}
                disabled={isAddingItem || !newItem.trim()}
              >
                {isAddingItem ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}