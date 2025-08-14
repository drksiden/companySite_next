import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (
  amount: number | null | undefined,
  currencySymbolOrCode: string = "KZT",
): string => {
  if (amount == null) {
    return "Цена по запросу";
  }

  // Маппинг символов валют к ISO кодам
  const currencyMapping: Record<string, string> = {
    "₸": "KZT",
    $: "USD",
    "€": "EUR",
    "₽": "RUB",
  };

  // Если передан символ, получаем код валюты
  const currencyCode =
    currencyMapping[currencySymbolOrCode] || currencySymbolOrCode;

  // Простое форматирование для тенге
  if (currencyCode.toUpperCase() === "KZT" || currencySymbolOrCode === "₸") {
    return `${amount.toLocaleString("kk-KZ")} ₸`;
  }

  // Для других валют используем стандартное форматирование
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  } catch (error) {
    // Если код валюты неверный, возвращаем простое форматирование
    return `${amount.toLocaleString("ru-RU")} ${currencySymbolOrCode}`;
  }
};
