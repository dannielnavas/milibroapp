import { UserModel } from "@/models/user";
import { create } from "zustand";

type UserStore = {
  user: UserModel;
  addUser: (payload: UserModel) => void;
  removeUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: {} as UserModel,
  addUser: (payload: UserModel) =>
    set((state) => ({
      ...state,
      user: payload,
    })),
  removeUser: () =>
    set(() => ({
      user: {} as UserModel,
    })),
}));
