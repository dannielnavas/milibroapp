import { Library } from "@/app/(tabs)";
import { create } from "zustand";

type LibraryModel = {
  library: Library[];
  addLibrary: (payload: Library) => void;
  removeLibrary: () => void;
};

export const useLibraryStore = create<LibraryModel>((set) => ({
  library: [] as Library[],
  addLibrary: (payload: Library) =>
    set((state) => ({
      ...state,
      library: [...state.library, payload],
    })),
  removeLibrary: () =>
    set(() => ({
      library: [] as Library[],
    })),
}));
