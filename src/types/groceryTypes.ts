export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface GroceryListData {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
}

// Add this line at the end of the file
export {};