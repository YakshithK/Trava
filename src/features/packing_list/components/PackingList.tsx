
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Luggage, Plus, Search, Filter, Loader2, Lock } from 'lucide-react';
import { fetchPackingList } from '../services/fetchPackingList';
import { subscribeToUpdates } from '../controllers/subToUpdates';
import { addItem } from '../utils/addItem';
import { PackingListItem, PackingListType } from '../types';
import { useToast } from '@/hooks/use-toast';

export function PackingList({ connectionId }: { connectionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [packingList, setPackingList] = useState<PackingListType | null>(null);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Clothing');
  const [filterCategory, setFilterCategory] = useState('all');
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
      toast({
        title: "Success",
        description: "Item added to packing list!",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const filteredItems = packingList?.items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
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
            <DialogTitle className="flex items-center gap-2">
              <Luggage className="h-5 w-5" />
              Shared Packing List
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
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
                    <Luggage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items found. Add some items to get started!</p>
                  </div>
                ) : (
                  filteredItems?.map(item => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={item.is_checked}
                          onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        />
                        <span className={item.is_checked ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>
                          {item.item_name}
                        </span>
                        <span className="text-sm px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="flex-1"
                disabled={isAddingItem}
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isAddingItem}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
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
