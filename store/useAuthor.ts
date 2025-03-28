import { create } from "zustand";

type AuthorModel = {
  author: string;
  addAuthor: (payload: string) => void;
  removeAuthor: () => void;
};

export const useAuthorStore = create<AuthorModel>((set) => ({
  author: "",
  addAuthor: (payload) => set(() => ({ author: payload })),
  removeAuthor: () => set(() => ({ author: "" })),
}));
