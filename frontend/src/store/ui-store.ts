import { create } from 'zustand';

interface UIStore {
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>(set => ({
  mobileSearchOpen: false,
  setMobileSearchOpen: v => set({ mobileSearchOpen: v }),
}));
