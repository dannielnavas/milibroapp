import { Book } from "@/components/cardBook";
import { create } from "zustand";

type BookModel = {
  books: Book[];
  addBooks: (payload: Book[]) => void;
  removeBooks: () => void;
};

export const useBooksStore = create<BookModel>((set) => ({
  books: [],
  addBooks: (payload) => set((state) => ({ books: [...state.books, ...payload] })),
  removeBooks: () => set(() => ({ books: [] })),
}));
