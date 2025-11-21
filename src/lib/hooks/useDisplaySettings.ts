import { useQuery } from "@tanstack/react-query";

interface DisplaySettings {
  show_stock_status: boolean;
  show_quantity: boolean;
  show_made_to_order: boolean;
  made_to_order_text: string;
  in_stock_text: string;
  out_of_stock_text: string;
  low_stock_threshold: number;
  show_low_stock_warning: boolean;
  low_stock_text: string;
}

const defaultSettings: DisplaySettings = {
  show_stock_status: true,
  show_quantity: true,
  show_made_to_order: true,
  made_to_order_text: "На заказ",
  in_stock_text: "В наличии",
  out_of_stock_text: "Нет в наличии",
  low_stock_threshold: 5,
  show_low_stock_warning: true,
  low_stock_text: "Осталось мало",
};

export function useDisplaySettings() {
  const { data, isLoading, error } = useQuery<DisplaySettings>({
    queryKey: ["display-settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/display");
      if (!response.ok) {
        throw new Error("Failed to fetch display settings");
      }
      const result = await response.json();
      return result.settings || defaultSettings;
    },
    staleTime: 5 * 60 * 1000, // Кэшируем на 5 минут
    gcTime: 10 * 60 * 1000, // Храним в кэше 10 минут
    retry: 1, // Повторяем только 1 раз при ошибке
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
    // Используем дефолтные настройки при SSR
    placeholderData: defaultSettings,
  });

  // Всегда возвращаем настройки (либо из кэша, либо дефолтные)
  return {
    settings: data || defaultSettings,
    isLoading,
    error,
  };
}

