import { Book } from "@/components/cardBook";
import { create } from "zustand";

type BookModel = {
  book: Book;
  addBook: (payload: Book) => void;
  removeBook: () => void;
};

export const useDetailsStore = create<BookModel>((set) => ({
  book: {} as Book,
  addBook: (payload: Book) =>
    set((state) => ({
      ...state,
      book: payload,
    })),
  removeBook: () =>
    set(() => ({
      book: {} as Book,
    })),
}));
