import { create } from "zustand";
import type { Item, ItemCreate, ItemUpdate } from "@/types";
import { itemApi } from "@/services/api";

interface ItemState {
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (data: ItemCreate) => Promise<Item>;
  updateItem: (id: string, data: ItemUpdate) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
  setSelectedItem: (item: Item | null) => void;
  clearError: () => void;
}

// Sample initial data for demo
const sampleItems: Item[] = [
  {
    id: "1",
    title: "Sample Item 1",
    description: "This is a sample item to demonstrate the CRUD functionality.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Sample Item 2",
    description: "Another sample item with some description text.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useItemStore = create<ItemState>((set, get) => ({
  items: sampleItems,
  selectedItem: null,
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await itemApi.list();
      set({ items, isLoading: false });
    } catch (error) {
      // If API is not available, keep sample data
      console.warn("API not available, using sample data:", error);
      set({ isLoading: false });
    }
  },

  createItem: async (data: ItemCreate) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await itemApi.create(data);
      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }));
      return newItem;
    } catch (error) {
      // Fallback: create item locally
      const newItem: Item = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }));
      return newItem;
    }
  },

  updateItem: async (id: string, data: ItemUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await itemApi.update(id, data);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
        isLoading: false,
      }));
      return updatedItem;
    } catch (error) {
      // Fallback: update item locally
      const existingItem = get().items.find((item) => item.id === id);
      if (!existingItem) throw new Error("Item not found");

      const updatedItem: Item = {
        ...existingItem,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
        isLoading: false,
      }));
      return updatedItem;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await itemApi.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      // Fallback: delete item locally
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }));
    }
  },

  setSelectedItem: (item: Item | null) => {
    set({ selectedItem: item });
  },

  clearError: () => {
    set({ error: null });
  },
}));
