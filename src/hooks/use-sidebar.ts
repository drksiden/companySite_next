import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";

type SidebarSettings = { disabled: boolean; isHoverOpen: boolean };
type SidebarStore = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsHover: (isHover: boolean) => void;
  getOpenState: () => boolean;
  setSettings: (settings: Partial<SidebarSettings>) => void;
};

// Базовый store без persist
const baseStore = (set: any, get: any): SidebarStore => ({
  isOpen: true,
  isHover: false,
  settings: { disabled: false, isHoverOpen: false },
  toggleOpen: () => {
    set({ isOpen: !get().isOpen });
  },
  setIsOpen: (isOpen: boolean) => {
    set({ isOpen });
  },
  setIsHover: (isHover: boolean) => {
    set({ isHover });
  },
  getOpenState: () => {
    const state = get();
    return state.isOpen || (state.settings.isHoverOpen && state.isHover);
  },
  setSettings: (settings: Partial<SidebarSettings>) => {
    set(
      produce((state: SidebarStore) => {
        state.settings = { ...state.settings, ...settings };
      })
    );
  }
});

// Функция для создания безопасного storage
const createSafeStorage = () => {
  // Проверяем наличие window и localStorage перед созданием storage
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    // Возвращаем заглушку для сервера с правильным интерфейсом
    return {
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {},
    };
  }
  // На клиенте возвращаем реальный localStorage
  return localStorage;
};

// Создаем store с безопасной оберткой для localStorage
// Важно: createJSONStorage вызывается с функцией, которая проверяет окружение
export const useSidebar = create(
  persist<SidebarStore>(
    baseStore,
    {
      name: "sidebar",
      storage: createJSONStorage(() => createSafeStorage()),
      skipHydration: true, // Пропускаем гидратацию, чтобы избежать проблем с SSR
    }
  )
);
