// store/authStore.ts

import { create } from "zustand";

export type User = {
  user_id: string;
  username: string;
  email: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  setLoading: (loading) => set({ loading }),
}));
