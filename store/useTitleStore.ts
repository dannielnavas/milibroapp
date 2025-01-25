import { create } from "zustand";

type TitleModel = {
  title: string | null;
  setTitle: (payload: string | null) => void;
};

export const useTitleStore = create<TitleModel>((set) => ({
  title: null,
  setTitle: (payload: string | null) =>
    set(() => ({
      title: payload,
    })),
}));
