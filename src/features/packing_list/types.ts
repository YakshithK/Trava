export interface PackingListItem {
    id: string;
    item_name: string;
    category: string;
    is_checked: string;
    assigned_to: string | null;
}

export interface PackingListType {
    id: string;
    title: string;
    items: PackingListItem[];
}