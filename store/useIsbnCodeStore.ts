import { create } from "zustand";

type IsbnCodeModel = {
  isbnCode: string | null;
  setCode: (payload: string | null) => void;
};

export const useIsbnCodeStore = create<IsbnCodeModel>((set) => ({
  isbnCode: null,
  setCode: (payload: string | null) =>
    set(() => ({
      isbnCode: payload,
    })),
}));
