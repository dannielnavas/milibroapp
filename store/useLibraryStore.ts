import { create } from "zustand";

interface LibraryData {
  id: string;
  wishlist: boolean;
}

type LibraryModel = {
  library: LibraryData;
  addLibrary: (payload: LibraryData) => void;
  removeLibrary: () => void;
};

export const useLibraryStore = create<LibraryModel>((set) => ({
  library: { id: "", wishlist: false },
  addLibrary: (payload) => set((state) => ({ library: payload })),
  removeLibrary: () => set(() => ({ library: { id: "", wishlist: false } })),
}));
